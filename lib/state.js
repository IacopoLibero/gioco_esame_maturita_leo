/**
 * In-memory room store.
 * Lives on globalThis to survive Next.js hot-module-reloads in dev and
 * to act as a singleton within a single serverless instance on Vercel.
 *
 * Limitation: NOT shared across multiple Vercel instances. For a school
 * demo with ~20 participants this is fine — one instance handles everything.
 */

function getStore() {
  if (!globalThis._leonardoRooms) globalThis._leonardoRooms = new Map()
  return globalThis._leonardoRooms
}

const TOTAL_LEVELS = 6

function newRoom(code) {
  return {
    code,
    status: 'waiting',        // 'waiting' | 'playing' | 'ended'
    currentLevel: -1,
    // answers[levelIndex] = { [deviceId]: choiceIndex }
    answers: Array.from({ length: TOTAL_LEVELS }, () => ({})),
    phones: new Set(),        // deviceIds of connected phones
    createdAt: Date.now(),
  }
}

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export function createOrRejoinRoom(savedCode) {
  const store = getStore()
  const code = savedCode?.toUpperCase()
  if (code && store.has(code)) return store.get(code)

  let newCode
  do { newCode = generateCode() } while (store.has(newCode))
  const room = newRoom(newCode)
  store.set(newCode, room)

  // Auto-cleanup rooms older than 6 hours
  setTimeout(() => store.delete(newCode), 6 * 60 * 60 * 1000)

  return room
}

export function getRoom(code) {
  return getStore().get(code?.toUpperCase()) ?? null
}

export function phoneJoin(room, deviceId) {
  room.phones.add(deviceId)
}

export function advance(room) {
  if (room.status === 'waiting') {
    room.status = 'playing'
    room.currentLevel = 0
  } else if (room.status === 'playing') {
    if (room.currentLevel < TOTAL_LEVELS - 1) {
      room.currentLevel++
    } else {
      room.status = 'ended'
    }
  }
}

export function restartWithNewRoom(oldCode) {
  const store = getStore()
  store.delete(oldCode?.toUpperCase())
  return createOrRejoinRoom(null)
}

export function submitAnswer(room, deviceId, choiceIndex) {
  if (room.status !== 'playing' || room.currentLevel < 0) return false
  if (room.answers[room.currentLevel][deviceId] !== undefined) return false // already answered
  if (typeof choiceIndex !== 'number' || choiceIndex < 0 || choiceIndex > 2) return false
  room.answers[room.currentLevel][deviceId] = choiceIndex
  return true
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
    phoneCount: room.phones.size,
    answers,          // anonymous array of {choiceIndex}
    myAnswer,         // null or choice index (for the phone to know it already answered)
    totalLevels: TOTAL_LEVELS,
  }
}
