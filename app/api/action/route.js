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

  const room = getRoom(roomCode)
  if (!room) {
    return NextResponse.json({ error: 'Stanza non trovata. Il gioco potrebbe essere scaduto.' }, { status: 404 })
  }

  switch (type) {
    case 'join': {
      if (!deviceId) return NextResponse.json({ error: 'deviceId mancante' }, { status: 400 })
      phoneJoin(room, deviceId)
      return NextResponse.json(serializeState(room, deviceId))
    }

    case 'advance': {
      advance(room)
      return NextResponse.json(serializeState(room, null))
    }

    case 'restart': {
      const newRoom = restartWithNewRoom(roomCode)
      return NextResponse.json(serializeState(newRoom, null))
    }

    case 'answer': {
      if (!deviceId) return NextResponse.json({ error: 'deviceId mancante' }, { status: 400 })
      const ok = submitAnswer(room, deviceId, body.choiceIndex)
      if (!ok) {
        // Either already answered or invalid — still return current state (not an error)
        return NextResponse.json(serializeState(room, deviceId))
      }
      return NextResponse.json(serializeState(room, deviceId))
    }

    default:
      return NextResponse.json({ error: `Azione sconosciuta: ${type}` }, { status: 400 })
  }
}
