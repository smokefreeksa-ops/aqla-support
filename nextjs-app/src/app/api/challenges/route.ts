import { NextRequest, NextResponse } from 'next/server'
import { CHALLENGES, completeChallenge, getCommunityStats, joinChallenge, type ChallengeId } from '@/lib/challenges.server'
import { getCurrentAqlaUser } from '@/lib/current-user.server'
import { validateMutationRequest } from '@/lib/http-security.server'

const ids=new Set(CHALLENGES.map(item=>item.id))
export async function GET(){try{return NextResponse.json(await getCommunityStats(),{headers:{'Cache-Control':'public, max-age=30, stale-while-revalidate=60'}})}catch{return NextResponse.json({error:'stats_unavailable'},{status:503})}}
export async function POST(request:NextRequest){
 const mutationError=validateMutationRequest(request,4096);if(mutationError)return NextResponse.json({error:mutationError.error},{status:mutationError.status})
 const user=await getCurrentAqlaUser();if(!user)return NextResponse.json({error:'not_authenticated'},{status:401})
 let raw:unknown;try{raw=await request.json()}catch{return NextResponse.json({error:'invalid_json'},{status:400})};if(!raw||typeof raw!=='object')return NextResponse.json({error:'invalid_request'},{status:400})
 const body=raw as Record<string,unknown>;const id=typeof body.challenge_id==='string'?body.challenge_id:'';const action=body.action==='complete'?'complete':'join';if(!ids.has(id as ChallengeId))return NextResponse.json({error:'invalid_challenge'},{status:400})
 try{const result=action==='complete'?await completeChallenge({userSub:user.sub,id:id as ChallengeId}):await joinChallenge({userSub:user.sub,id:id as ChallengeId,city:typeof body.city==='string'?body.city:undefined});return NextResponse.json(result,{headers:{'Cache-Control':'no-store, private'}})}catch(error){const message=error instanceof Error?error.message:'challenge_unavailable';const status=message==='not_joined'?409:503;return NextResponse.json({error:message},{status})}
}
