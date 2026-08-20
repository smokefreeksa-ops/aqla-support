import { NextResponse } from 'next/server'
import { listUserChallenges } from '@/lib/challenges.server'
import { getCurrentAqlaUser } from '@/lib/current-user.server'

export async function GET(){const user=await getCurrentAqlaUser();if(!user)return NextResponse.json({error:'not_authenticated'},{status:401,headers:{'Cache-Control':'no-store, private'}});try{return NextResponse.json({challenges:await listUserChallenges(user.sub)},{headers:{'Cache-Control':'no-store, private'}})}catch{return NextResponse.json({error:'progress_unavailable'},{status:503,headers:{'Cache-Control':'no-store, private'}})}}
