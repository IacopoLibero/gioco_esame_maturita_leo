/**
 * State store with dual backend:
 * - Redis (Upstash) when UPSTASH_REDIS_REST_URL is set → survives across Vercel instances
 * - In-memory Map otherwise → local development
 */

import { Redis } from '@upstash/redis'

const TOTAL_LEVELS = 6
const ROOM_TTL_SEC = 6 * 60 * 60 // 6 hours

// ─── Backend selection ────────────────────────────────────────────────────────

let _redis = null

function getRedis() {
  if (!_redis && process.env.UPSTASH_REDIS_REST_URL) {
    _redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  }
  return _redis
}

function getMemStore() {
  if (!globalThis._leonardoRooms) globalThis._leonardoRooms = new Map()
  return globalThis._leonardoRooms
}

// ─── Serialization ────────────────────────────────────────────────────────────

function newRoomData(code) {
  return {
    code,
    status: 'waiting',
    currentLevel: -1,
    answers: Array.from({ length: TOTAL_LEVELS }, () => ({})),
    phones: [],   // stored as array; deduped on join
    createdAt: Date.now(),
  }
}

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getRoom(code) {
  if (!code) return null
  const key = code.toUpperCase()
  const redis = getRedis()
  if (redis) {
    const data = await redis.get(`room:${key}`)
    return data ?? null
  }
  return getMemStore().get(key) ?? null
}

// ─── Write ────────────────────────────────────────────────────────────────────

async function saveRoom(room) {
  const redis = getRedis()
  if (redis) {
    await redis.set(`room:${room.code}`, room, { ex: ROOM_TTL_SEC })
  } else {
    getMemStore().set(room.code, room)
  }
  return room
}

async function deleteRoom(code) {
  const redis = getRedis()
  if (redis) {
    await redis.del(`room:${code}`)
  } else {
    getMemStore().delete(code)
  }
}

// ─── Public API (all async) ───────────────────────────────────────────────────

export async function createOrRejoinRoom(savedCode) {
  const code = savedCode?.toUpperCase()
  if (code) {
    const existing = await getRoom(code)
    if (existing) return existing
  }

  let newCode
  do { newCode = generateCode() } while (await getRoom(newCode))

  return saveRoom(newRoomData(newCode))
}

export async function phoneJoin(room, deviceId) {
  if (room.phones.includes(deviceId)) return room
  return saveRoom({ ...room, phones: [...room.phones, deviceId] })
}

export async function advance(room) {
  let updated
  if (room.status === 'waiting') {
    updated = { ...room, status: 'playing', currentLevel: 0 }
  } else if (room.status === 'playing') {
    if (room.currentLevel < TOTAL_LEVELS - 1) {
      updated = { ...room, currentLevel: room.currentLevel + 1 }
    } else {
      updated = { ...room, status: 'ended' }
    }
  } else {
    return room
  }
  return saveRoom(updated)
}

export async function restartWithNewRoom(oldCode) {
  await deleteRoom(oldCode?.toUpperCase())
  let newCode
  do { newCode = generateCode() } while (await getRoom(newCode))
  return saveRoom(newRoomData(newCode))
}

export async function submitAnswer(room, deviceId, choiceIndex) {
  if (room.status !== 'playing' || room.currentLevel < 0) return null
  if (typeof choiceIndex !== 'number' || choiceIndex < 0 || choiceIndex > 2) return null
  const lvl = room.currentLevel
  if (room.answers[lvl][deviceId] !== undefined) return room // already answered

  const newAnswers = room.answers.map((a, i) =>
    i === lvl ? { ...a, [deviceId]: choiceIndex } : a
  )
  return saveRoom({ ...room, answers: newAnswers })
}

export function serializeState(room, deviceId) {
  const answers =
    room.currentLevel >= 0
      ? Object.values(room.answers[room.currentLevel]).map(ci => ({ choiceIndex: ci }))
      : []

  const myAnswer =
    deviceId && room.currentLevel >= 0
      ? room.answers[room.currentLevel][deviceId] ?? null
      : null

  return {
    roomCode: room.code,
    status: room.status,
    currentLevel: room.currentLevel,
    phoneCount: room.phones.length,
    answers,
    myAnswer,
    totalLevels: TOTAL_LEVELS,
  }
}
