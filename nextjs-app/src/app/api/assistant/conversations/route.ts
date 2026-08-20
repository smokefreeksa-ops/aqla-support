import { NextResponse } from 'next/server'
import { getCurrentAqlaUser } from '@/lib/current-user.server'
import { listConversations } from '@/lib/conversation-store.server'

export const dynamic = 'force-dynamic'
const PRIVATE_HEADERS = { 'Cache-Control': 'no-store, private' }

export async function GET() {
  const user = await getCurrentAqlaUser()
  if (!user) return NextResponse.json({ error: 'not_authenticated' }, { status: 401, headers: PRIVATE_HEADERS })

  try {
    const conversations = await listConversations(user.sub, 40)
    return NextResponse.json({ conversations }, { headers: PRIVATE_HEADERS })
  } catch (error) {
    console.error('Aqla conversation list unavailable', error instanceof Error ? error.message : 'unknown')
    return NextResponse.json({ error: 'conversation_list_unavailable' }, { status: 502, headers: PRIVATE_HEADERS })
  }
}
