import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, QueryCommand, TransactWriteCommand, type TransactWriteCommandInput } from '@aws-sdk/lib-dynamodb'
import { CHALLENGES, type ChallengeId } from '@/lib/challenges.types'
import { QUIT_PLAN_TABLE } from '@/lib/quit-engine/store.server'

export { CHALLENGES, type ChallengeId } from '@/lib/challenges.types'

const region=process.env.AWS_REGION||'eu-west-2'
const ddb=DynamoDBDocumentClient.from(new DynamoDBClient({region}),{marshallOptions:{removeUndefinedValues:true}})
export const CHALLENGE_SCHEMA_VERSION=1
export const CITY_PUBLIC_MIN_CELL=10
export const DAY_28_MINIMUM_MS=28*24*60*60*1000

function challenge(id:string){return CHALLENGES.find(c=>c.id===id)}
function normaliseCity(raw?:string){if(!raw)return undefined;return raw.trim().toLowerCase().replace(/\s+/g,' ').slice(0,80)||undefined}

export async function getUserChallenge(userSub:string,id:ChallengeId){const res=await ddb.send(new GetCommand({TableName:QUIT_PLAN_TABLE,Key:{PK:`USER#${userSub}`,SK:`CHALLENGE#${id}`},ConsistentRead:true}));return res.Item??null}

export async function joinChallenge({userSub,id,city}:{userSub:string;id:ChallengeId;city?:string}){
 const def=challenge(id);if(!def)throw new Error('invalid_challenge');const now=new Date().toISOString();const existing=await getUserChallenge(userSub,id);if(existing)return {state:String(existing.state||'joined'),already:true}
 const cityKey=normaliseCity(city)
 const tx:NonNullable<TransactWriteCommandInput['TransactItems']>=[
  {Put:{TableName:QUIT_PLAN_TABLE,Item:{PK:`USER#${userSub}`,SK:`CHALLENGE#${id}`,entity_type:'challenge_progress',schema_version:CHALLENGE_SCHEMA_VERSION,challenge_id:id,state:'joined',city:cityKey,joined_at:now,updated_at:now},ConditionExpression:'attribute_not_exists(PK) AND attribute_not_exists(SK)'}},
  {Update:{TableName:QUIT_PLAN_TABLE,Key:{PK:'COMMUNITY#CHALLENGES',SK:`CHALLENGE#${id}`},UpdateExpression:'SET schema_version=:v, title_ar=:ar, title_en=:en, updated_at=:now ADD joined_count :one',ExpressionAttributeValues:{':v':CHALLENGE_SCHEMA_VERSION,':ar':def.title_ar,':en':def.title_en,':now':now,':one':1}}},
  {Update:{TableName:QUIT_PLAN_TABLE,Key:{PK:'COMMUNITY#TOTALS',SK:'CHALLENGES'},UpdateExpression:'SET updated_at=:now ADD challenge_joins :one',ExpressionAttributeValues:{':now':now,':one':1}}},
 ]
 if(cityKey)tx.push({Update:{TableName:QUIT_PLAN_TABLE,Key:{PK:'COMMUNITY#CITIES',SK:`CITY#${cityKey}`},UpdateExpression:'SET city=:city, updated_at=:now ADD engagement_count :one, challenge_joins :one',ExpressionAttributeValues:{':city':cityKey,':now':now,':one':1}}})
 try{await ddb.send(new TransactWriteCommand({TransactItems:tx}));return {state:'joined' as const,already:false}}catch(error){if(error instanceof Error&&error.name==='TransactionCanceledException')return {state:'joined' as const,already:true};throw error}
}

async function completeChallengeInternal({userSub,id,allowKnowledge=false}:{userSub:string;id:ChallengeId;allowKnowledge?:boolean}){
 const def=challenge(id);if(!def)throw new Error('invalid_challenge');const current=await getUserChallenge(userSub,id);if(!current)throw new Error('not_joined');if(current.state==='completed')return {state:'completed' as const,already:true,points:Number(current.points_awarded||def.points)}
 if(id==='knowledge'&&!allowKnowledge)throw new Error('academy_completion_required')
 if(id==='day_28'){
  const joinedAt=Date.parse(String(current.joined_at||''));if(!Number.isFinite(joinedAt)||Date.now()-joinedAt<DAY_28_MINIMUM_MS)throw new Error('day_28_not_due')
 }
 const now=new Date().toISOString()
 await ddb.send(new TransactWriteCommand({TransactItems:[
  {Update:{TableName:QUIT_PLAN_TABLE,Key:{PK:`USER#${userSub}`,SK:`CHALLENGE#${id}`},UpdateExpression:'SET #state=:completed, completed_at=:now, updated_at=:now, points_awarded=:points',ConditionExpression:'#state=:joined',ExpressionAttributeNames:{'#state':'state'},ExpressionAttributeValues:{':completed':'completed',':joined':'joined',':now':now,':points':def.points}}},
  {Update:{TableName:QUIT_PLAN_TABLE,Key:{PK:`USER#${userSub}`,SK:'COMMUNITY#POINTS'},UpdateExpression:'SET updated_at=:now ADD points_total :points, challenges_completed :one',ExpressionAttributeValues:{':now':now,':points':def.points,':one':1}}},
  {Update:{TableName:QUIT_PLAN_TABLE,Key:{PK:'COMMUNITY#CHALLENGES',SK:`CHALLENGE#${id}`},UpdateExpression:'SET updated_at=:now ADD completed_count :one, points_awarded :points',ExpressionAttributeValues:{':now':now,':one':1,':points':def.points}}},
  {Update:{TableName:QUIT_PLAN_TABLE,Key:{PK:'COMMUNITY#TOTALS',SK:'CHALLENGES'},UpdateExpression:'SET updated_at=:now ADD challenge_completions :one, points_awarded :points',ExpressionAttributeValues:{':now':now,':one':1,':points':def.points}}},
 ]}));return {state:'completed' as const,already:false,points:def.points}
}

export async function completeChallenge(input:{userSub:string;id:ChallengeId}){return completeChallengeInternal(input)}
export async function completeKnowledgeChallengeFromAcademy(userSub:string){return completeChallengeInternal({userSub,id:'knowledge',allowKnowledge:true})}

export async function listUserChallenges(userSub:string){const res=await ddb.send(new QueryCommand({TableName:QUIT_PLAN_TABLE,KeyConditionExpression:'PK=:pk AND begins_with(SK,:prefix)',ExpressionAttributeValues:{':pk':`USER#${userSub}`,':prefix':'CHALLENGE#'}}));return (res.Items??[]).map(item=>({challenge_id:String(item.challenge_id||String(item.SK).replace('CHALLENGE#','')),state:String(item.state||'joined'),joined_at:typeof item.joined_at==='string'?item.joined_at:undefined,completed_at:typeof item.completed_at==='string'?item.completed_at:undefined,points_awarded:Number(item.points_awarded||0)}))}

export async function getCommunityStats(){
 const [challengeRows,cityRows,totals]=await Promise.all([
  ddb.send(new QueryCommand({TableName:QUIT_PLAN_TABLE,KeyConditionExpression:'PK=:pk',ExpressionAttributeValues:{':pk':'COMMUNITY#CHALLENGES'}})),
  ddb.send(new QueryCommand({TableName:QUIT_PLAN_TABLE,KeyConditionExpression:'PK=:pk',ExpressionAttributeValues:{':pk':'COMMUNITY#CITIES'}})),
  ddb.send(new GetCommand({TableName:QUIT_PLAN_TABLE,Key:{PK:'COMMUNITY#TOTALS',SK:'CHALLENGES'}})),
 ])
 const visibleCities:Array<{city:string;engagement_count:number;challenge_joins:number}>=[];let hiddenEngagement=0
 for(const row of cityRows.Items??[]){const count=Number(row.engagement_count||0);if(count>=CITY_PUBLIC_MIN_CELL)visibleCities.push({city:String(row.city||''),engagement_count:count,challenge_joins:Number(row.challenge_joins||0)});else hiddenEngagement+=count}
 visibleCities.sort((a,b)=>b.engagement_count-a.engagement_count)
 return {generated_at:new Date().toISOString(),minimum_city_cell:CITY_PUBLIC_MIN_CELL,totals:{challenge_joins:Number(totals.Item?.challenge_joins||0),challenge_completions:Number(totals.Item?.challenge_completions||0),points_awarded:Number(totals.Item?.points_awarded||0),cities_visible:visibleCities.length},challenges:(challengeRows.Items??[]).map(row=>({challenge_id:String(row.SK).replace('CHALLENGE#',''),joined_count:Number(row.joined_count||0),completed_count:Number(row.completed_count||0),points_awarded:Number(row.points_awarded||0)})),cities:visibleCities,other_small_cell_engagement:hiddenEngagement}
}
