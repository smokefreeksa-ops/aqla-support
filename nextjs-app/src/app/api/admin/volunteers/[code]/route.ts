import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAqlaUser, hasAqlaRole } from '@/lib/current-user.server'
import { validateMutationRequest } from '@/lib/http-security.server'
import { updateVolunteerStatus, type VolunteerStatus } from '@/lib/volunteer.server'

const STATUSES=['submitted','screening','training','approved','active','paused','declined'] as const
export async function PATCH(request:NextRequest,{params}:{params:Promise<{code:string}>}){
 const mutationError=validateMutationRequest(request,4096);if(mutationError)return NextResponse.json({error:mutationError.error},{status:mutationError.status})
 const user=await getCurrentAqlaUser();if(!user)return NextResponse.json({error:'not_authenticated'},{status:401});if(!hasAqlaRole(user,'admin'))return NextResponse.json({error:'forbidden'},{status:403})
 const {code}=await params;let raw:unknown;try{raw=await request.json()}catch{return NextResponse.json({error:'invalid_json'},{status:400})};const status=raw&&typeof raw==='object'?(raw as Record<string,unknown>).status:undefined;if(typeof status!=='string'||!(STATUSES as readonly string[]).includes(status))return NextResponse.json({error:'invalid_status'},{status:400})
 try{await updateVolunteerStatus(code,status as VolunteerStatus);return NextResponse.json({ok:true,status})}catch{return NextResponse.json({error:'update_failed'},{status:503})}
}
