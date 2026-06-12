'use client'
import { useState, useEffect, useRef, useCallback } from 'react'

const POLL_MS = 3000

export function useGameState(roomCode, deviceId) {
  const [state, setState] = useState(null)
  const [error, setError] = useState(null)
  const intervalRef = useRef(null)
  const mountedRef = useRef(true)

  const fetchState = useCallback(async () => {
    if (!roomCode || !mountedRef.current) return
    try {
      const res = await fetch(
        `/api/state?roomCode=${encodeURIComponent(roomCode)}&deviceId=${encodeURIComponent(deviceId || '')}`
      )
      if (!mountedRef.current) return
      if (res.ok) {
        setState(await res.json())
        setError(null)
      } else if (res.status === 404) {
        // Room no longer exists — happens when the board restarts with a new code
        setState(null)
        setError('ROOM_GONE')
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Errore di connessione al server')
      }
    } catch {
      if (mountedRef.current) setError('Connessione al server persa. Verifica la rete.')
    }
  }, [roomCode, deviceId])

  useEffect(() => {
    if (!roomCode) return
    mountedRef.current = true
    fetchState()
    intervalRef.current = setInterval(fetchState, POLL_MS)
    return () => {
      mountedRef.current = false
      clearInterval(intervalRef.current)
    }
  }, [fetchState, roomCode])

  // Returns the response data so callers can react to new roomCode on restart
  const doAction = useCallback(
    async (type, payload = {}) => {
      try {
        const res = await fetch('/api/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, roomCode, deviceId, ...payload }),
        })
        const data = await res.json()
        if (res.ok && mountedRef.current) {
          setState(data)
          setError(null)
          return data
        }
        if (mountedRef.current) setError(data.error || 'Azione non riuscita')
        return null
      } catch {
        if (mountedRef.current) setError('Errore di rete')
        return null
      }
    },
    [roomCode, deviceId]
  )

  return { state, error, doAction }
}
