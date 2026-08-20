import { randomBytes, randomUUID } from 'node:crypto'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, QueryCommand, TransactWriteCommand, UpdateCommand, type TransactWriteCommandInput } from '@aws-sdk/lib-dynamodb'
import { QUIT_PLAN_TABLE } from '@/lib/quit-engine/store.server'

const region=process.env.AWS_REGION||'eu-west-2'
const ddb=DynamoDBDocumentClient.from(new DynamoDBClient({region}),{marshallOptions:{removeUndefinedValues:true}})
export const VOLUNTEER_SCHEMA_VERSION=1
export const VOLUNTEER_INTERESTS=['awareness_campaigns','smoker_support','data_entry','follow_up_coordination','content_creation','events'] as const
export type VolunteerInterest=typeof VOLUNTEER_INTERESTS[number]
export type VolunteerStatus='submitted'|'screening'|'training'|'approved'|'active'|'paused'|'declined'

export interface VolunteerApplicationInput{
 full_name:string;mobile:string;email?:string;age?:number;gender?:string;city?:string;affiliation?:string;academic_level?:string;
 preferred_language:'ar'|'en';preferred_contact:'whatsapp'|'sms'|'phone'|'email';motivation?:string;prior_awareness_work?:boolean;
 smoking_status?:'smoker'|'former_smoker'|'non_smoker';availability?:string;interests:VolunteerInterest[];
 screening:{agree_professional_boundaries:boolean;understand_no_medical_advice:boolean;agree_clinical_referral:boolean;agree_complete_training:boolean}
}
export interface VolunteerRecord extends VolunteerApplicationInput{application_id:string;volunteer_code:string;status:VolunteerStatus;created_at:string;updated_at:string}

function cleanText(value:unknown,max:number){return typeof value==='string'?value.trim().slice(0,max):''}
function normaliseCity(value?:string){return value?.trim().toLowerCase().replace(/\s+/g,' ').slice(0,80)||undefined}
function code(){return `AQ-V-${new Date().getUTCFullYear()}-${randomBytes(4).toString('hex').toUpperCase()}`}

export function validateVolunteerInput(raw:unknown):VolunteerApplicationInput{
 if(!raw||typeof raw!=='object')throw new Error('invalid_application');const r=raw as Record<string,unknown>
 const full_name=cleanText(r.full_name,120),mobile=cleanText(r.mobile,40),email=cleanText(r.email,255).toLowerCase()
 if(full_name.length<2||mobile.length<6)throw new Error('required_fields')
 if(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new Error('invalid_email')
 const interests=Array.isArray(r.interests)?Array.from(new Set(r.interests.filter((x):x is VolunteerInterest=>typeof x==='string'&&(VOLUNTEER_INTERESTS as readonly string[]).includes(x)))).slice(0,6):[]
 if(!interests.length)throw new Error('interest_required')
 const sc=r.screening&&typeof r.screening==='object'?r.screening as Record<string,unknown>:{}
 const screening={agree_professional_boundaries:sc.agree_professional_boundaries===true,understand_no_medical_advice:sc.understand_no_medical_advice===true,agree_clinical_referral:sc.agree_clinical_referral===true,agree_complete_training:sc.agree_complete_training===true}
 if(!Object.values(screening).every(Boolean))throw new Error('screening_required')
 const preferred_contact=['whatsapp','sms','phone','email'].includes(String(r.preferred_contact))?String(r.preferred_contact) as VolunteerApplicationInput['preferred_contact']:'whatsapp'
 const age=typeof r.age==='number'&&Number.isInteger(r.age)&&r.age>=14&&r.age<=100?r.age:undefined
 return {full_name,mobile,email:email||undefined,age,gender:cleanText(r.gender,30)||undefined,city:cleanText(r.city,80)||undefined,affiliation:cleanText(r.affiliation,160)||undefined,academic_level:cleanText(r.academic_level,60)||undefined,preferred_language:r.preferred_language==='en'?'en':'ar',preferred_contact,motivation:cleanText(r.motivation,1000)||undefined,prior_awareness_work:typeof r.prior_awareness_work==='boolean'?r.prior_awareness_work:undefined,smoking_status:['smoker','former_smoker','non_smoker'].includes(String(r.smoking_status))?String(r.smoking_status) as VolunteerApplicationInput['smoking_status']:undefined,availability:cleanText(r.availability,500)||undefined,interests,screening}
}

export async function createVolunteerApplication(input:VolunteerApplicationInput){
 const now=new Date().toISOString(),application_id=randomUUID(),volunteer_code=code();const record:VolunteerRecord={...input,application_id,volunteer_code,status:'submitted',created_at:now,updated_at:now};const applicationSk=`${now}#${application_id}`;const cityKey=normaliseCity(input.city)
 const tx:NonNullable<TransactWriteCommandInput['TransactItems']>=[
  {Put:{TableName:QUIT_PLAN_TABLE,Item:{PK:'VOLUNTEER#APPLICATIONS',SK:applicationSk,entity_type:'volunteer_application',schema_version:VOLUNTEER_SCHEMA_VERSION,...record},ConditionExpression:'attribute_not_exists(PK) AND attribute_not_exists(SK)'}},
  {Put:{TableName:QUIT_PLAN_TABLE,Item:{PK:'VOLUNTEER#LOOKUP',SK:`CODE#${volunteer_code}`,entity_type:'volunteer_lookup',application_pk:'VOLUNTEER#APPLICATIONS',application_sk:applicationSk,created_at:now},ConditionExpression:'attribute_not_exists(PK) AND attribute_not_exists(SK)'}},
  {Update:{TableName:QUIT_PLAN_TABLE,Key:{PK:'COMMUNITY#TOTALS',SK:'CHALLENGES'},UpdateExpression:'SET updated_at=:now ADD volunteer_applications :one',ExpressionAttributeValues:{':now':now,':one':1}}},
 ]
 if(cityKey)tx.push({Update:{TableName:QUIT_PLAN_TABLE,Key:{PK:'COMMUNITY#CITIES',SK:`CITY#${cityKey}`},UpdateExpression:'SET city=:city, updated_at=:now ADD engagement_count :one, volunteer_applications :one',ExpressionAttributeValues:{':city':cityKey,':now':now,':one':1}}})
 await ddb.send(new TransactWriteCommand({TransactItems:tx}))
 return {application_id,volunteer_code,status:'submitted' as const}
}

export async function listVolunteerApplications(limit=100){
 const result=await ddb.send(new QueryCommand({TableName:QUIT_PLAN_TABLE,KeyConditionExpression:'PK = :pk',ExpressionAttributeValues:{':pk':'VOLUNTEER#APPLICATIONS'},ScanIndexForward:false,Limit:Math.max(1,Math.min(200,limit))}))
 return (result.Items??[]) as VolunteerRecord[]
}

export async function getVolunteerByCode(volunteerCode:string){
 const lookup=await ddb.send(new GetCommand({TableName:QUIT_PLAN_TABLE,Key:{PK:'VOLUNTEER#LOOKUP',SK:`CODE#${volunteerCode}`},ConsistentRead:true}));if(!lookup.Item)return null
 const record=await ddb.send(new GetCommand({TableName:QUIT_PLAN_TABLE,Key:{PK:String(lookup.Item.application_pk),SK:String(lookup.Item.application_sk)},ConsistentRead:true}));return record.Item as VolunteerRecord|undefined||null
}

export async function updateVolunteerStatus(volunteerCode:string,status:VolunteerStatus){
 const lookup=await ddb.send(new GetCommand({TableName:QUIT_PLAN_TABLE,Key:{PK:'VOLUNTEER#LOOKUP',SK:`CODE#${volunteerCode}`},ConsistentRead:true}));if(!lookup.Item)throw new Error('not_found')
 await ddb.send(new UpdateCommand({TableName:QUIT_PLAN_TABLE,Key:{PK:String(lookup.Item.application_pk),SK:String(lookup.Item.application_sk)},UpdateExpression:'SET #status=:status, updated_at=:now',ExpressionAttributeNames:{'#status':'status'},ExpressionAttributeValues:{':status':status,':now':new Date().toISOString()}}))
}
