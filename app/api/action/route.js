import { NextResponse } from 'next/server'
import {
  getRoom,
  phoneJoin,
  advance,
  restartWithNewRoom,
  submitAnswer,
  serializeState,
} from '@/lib/state'

export async function POST(request) {
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Corpo della richiesta non valido' }, { status: 400 })
  }

  const { type, roomCode, deviceId } = body

  if (!roomCode) {
    return NextResponse.json({ error: 'roomCode mancante' }, { status: 400 })
  }

  // restart creates a new room — handle before the getRoom check
  if (type === 'restart') {
    const newRoom = await restartWithNewRoom(roomCode)
    return NextResponse.json(serializeState(newRoom, null))
  }

  const room = await getRoom(roomCode)
  if (!room) {
    return NextResponse.json(
      { error: 'Stanza non trovata. Il gioco potrebbe essere scaduto.' },
      { status: 404 }
    )
  }

  switch (type) {
    case 'join': {
      if (!deviceId) return NextResponse.json({ error: 'deviceId mancante' }, { status: 400 })
      const updated = await phoneJoin(room, deviceId)
      return NextResponse.json(serializeState(updated, deviceId))
    }

    case 'advance': {
      const updated = await advance(room)
      return NextResponse.json(serializeState(updated, null))
    }

    case 'answer': {
      if (!deviceId) return NextResponse.json({ error: 'deviceId mancante' }, { status: 400 })
      const updated = await submitAnswer(room, deviceId, body.choiceIndex)
      return NextResponse.json(serializeState(updated ?? room, deviceId))
    }

    default:
      return NextResponse.json({ error: `Azione sconosciuta: ${type}` }, { status: 400 })
  }
}
