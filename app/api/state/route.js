import { NextResponse } from 'next/server'
import { getRoom, serializeState } from '@/lib/state'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const roomCode = searchParams.get('roomCode')
  const deviceId = searchParams.get('deviceId') || null

  if (!roomCode) {
    return NextResponse.json({ error: 'roomCode mancante' }, { status: 400 })
  }

  const room = getRoom(roomCode)
  if (!room) {
    return NextResponse.json({ error: 'Stanza non trovata' }, { status: 404 })
  }

  return NextResponse.json(serializeState(room, deviceId))
}
