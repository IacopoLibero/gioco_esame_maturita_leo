import { NextResponse } from 'next/server'
import { createOrRejoinRoom, serializeState } from '@/lib/state'

export async function POST(request) {
  try {
    const { savedRoomCode } = await request.json()
    const room = createOrRejoinRoom(savedRoomCode)
    return NextResponse.json(serializeState(room, null))
  } catch {
    return NextResponse.json({ error: 'Impossibile creare la stanza' }, { status: 500 })
  }
}
