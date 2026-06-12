'use client'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Board from '@/src/Board'
import Phone from '@/src/Phone'
import Landing from '@/src/Landing'

function AppRouter() {
  const params = useSearchParams()
  const isBoard = params.has('board')
  const roomCode = params.get('room')

  if (isBoard) return <Board />
  if (roomCode) return <Phone roomCode={roomCode.toUpperCase()} />
  return <Landing />
}

export default function Page() {
  return (
    <Suspense fallback={<div className="state-screen"><p>Caricamento...</p></div>}>
      <AppRouter />
    </Suspense>
  )
}
