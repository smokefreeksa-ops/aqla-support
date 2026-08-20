import { NextResponse } from 'next/server'
import { getCurrentAqlaUser } from '@/lib/current-user.server'
import { getConversationMessages } from '@/lib/conversation-store.server'

export const dynamic = 'force-dynamic'
const PRIVATE_HEADERS = { 'Cache-Control': 'no-store, private' }

export async function GET(
  _request: Request,
  context: { params: Promise<{ conversationId: string }> },
) {
  const user = await getCurrentAqlaUser()
  if (!user) return NextResponse.json({ error: 'not_authenticated' }, { status: 401, headers: PRIVATE_HEADERS })

  const { conversationId } = await context.params
  const id = conversationId.trim().slice(0, 100)
  if (!id) return NextResponse.json({ error: 'conversation_required' }, { status: 400, headers: PRIVATE_HEADERS })

  try {
    const messages = await getConversationMessages(user.sub, id, 100)
    return NextResponse.json({ conversation_id: id, messages }, { headers: PRIVATE_HEADERS })
  } catch (error) {
    console.error('Aqla conversation read unavailable', error instanceof Error ? error.message : 'unknown')
    return NextResponse.json({ error: 'conversation_unavailable' }, { status: 502, headers: PRIVATE_HEADERS })
  }
}
