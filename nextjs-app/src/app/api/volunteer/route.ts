import { NextRequest, NextResponse } from 'next/server'
import { validateMutationRequest } from '@/lib/http-security.server'
import { createVolunteerApplication, validateVolunteerInput } from '@/lib/volunteer.server'

export async function POST(request:NextRequest){
 const mutationError=validateMutationRequest(request,24*1024);if(mutationError)return NextResponse.json({error:mutationError.error},{status:mutationError.status})
 let raw:unknown;try{raw=await request.json()}catch{return NextResponse.json({error:'invalid_json'},{status:400})}
 try{const input=validateVolunteerInput(raw);const result=await createVolunteerApplication(input);return NextResponse.json(result,{status:201,headers:{'Cache-Control':'no-store, private'}})}catch(error){const message=error instanceof Error?error.message:'invalid_application';const status=['required_fields','invalid_email','interest_required','screening_required','invalid_application'].includes(message)?400:503;return NextResponse.json({error:message},{status,headers:{'Cache-Control':'no-store, private'}})}
}
