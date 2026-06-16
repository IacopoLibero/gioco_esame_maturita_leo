'use client'
import { useState, useEffect, useRef } from 'react'
import { Zap, CheckCircle, Quote, RefreshCw } from 'lucide-react'
import LogoIcon from './LogoIcon'
import { useGameState } from './useGameState'
import { levels } from './content'

const LETTERS = ['A', 'B', 'C']

function getOrCreate(key) {
  if (typeof window === 'undefined') return ''
  let v = sessionStorage.getItem(key)
  if (!v) {
    v = Math.random().toString(36).slice(2) + Date.now().toString(36)
    sessionStorage.setItem(key, v)
  }
  return v
}

export default function Phone({ roomCode }) {
  const [deviceId] = useState(() => getOrCreate('phoneDeviceId'))
  const [joined, setJoined] = useState(false)
  const [joinError, setJoinError] = useState(null)
  const joinedRef = useRef(false)

  useEffect(() => {
    if (joinedRef.current) return
    joinedRef.current = true

    fetch('/api/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'join', roomCode, deviceId }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) setJoinError(data.error)
        else setJoined(true)
      })
      .catch(() => setJoinError('Errore di rete. Ricarica la pagina.'))
  }, [roomCode, deviceId])

  const { state, error, doAction } = useGameState(joined ? roomCode : null, deviceId)

  if (joinError) {
    return (
      <div className="phone-layout">
        <PhoneTopBar />
        <div className="state-screen">
          <div className="error-box">{joinError}</div>
          <p>Scansiona di nuovo il QR code dalla lavagna.</p>
        </div>
      </div>
    )
  }

  if (error === 'ROOM_GONE') {
    return (
      <div className="phone-layout">
        <PhoneTopBar />
        <div className="state-screen">
          <RefreshCw size={40} color="var(--color-primary)" strokeWidth={1.5} />
          <p style={{ fontWeight: 600, color: 'var(--color-text)' }}>
            Il gioco è stato riavviato.
          </p>
          <p>Scansiona di nuovo il QR code dalla lavagna per ricominciare.</p>
        </div>
      </div>
    )
  }

  if (!joined || !state) {
    return (
      <div className="phone-layout">
        <PhoneTopBar />
        <div className="state-screen">
          <div className="pulse-dot"><span /><span /><span /></div>
          <p>Collegamento in corso…</p>
        </div>
      </div>
    )
  }

  if (state.status === 'waiting') {
    return (
      <div className="phone-layout">
        <PhoneTopBar roomCode={state.roomCode} />
        <WaitingScreen />
      </div>
    )
  }

  if (state.status === 'ended') {
    return (
      <div className="phone-layout">
        <PhoneTopBar />
        <EndedScreen />
      </div>
    )
  }

  const level = levels[state.currentLevel]
  const alreadyAnswered = state.myAnswer !== null && state.myAnswer !== undefined

  if (alreadyAnswered) {
    return (
      <div className="phone-layout">
        <PhoneTopBar roomCode={state.roomCode} levelIndex={state.currentLevel} />
        <AnsweredScreen choiceText={level.choices[state.myAnswer]} />
        {error && error !== 'ROOM_GONE' && <div className="error-box">{error}</div>}
      </div>
    )
  }

  return (
    <div className="phone-layout">
      <PhoneTopBar roomCode={state.roomCode} levelIndex={state.currentLevel} />
      <QuestionScreen
        level={level}
        levelIndex={state.currentLevel}
        onAnswer={(ci) => doAction('answer', { choiceIndex: ci })}
        error={error}
      />
    </div>
  )
}

// ─── Sub-screens ──────────────────────────────────────────────────────────────

function WaitingScreen() {
  return (
    <div className="phone-waiting">
      <div className="phone-waiting__icon">
        <Zap size={32} strokeWidth={1.5} />
      </div>
      <h2 className="phone-waiting__title">Sei dentro.</h2>
      <p className="phone-waiting__subtitle">
        "L'unica costante della vita è il cambiamento"
      </p>
      <p className="phone-waiting__quote-author">
        — Buddha
      </p>
      <div className="pulse-dot">
        <span /><span /><span />
      </div>
    </div>
  )
}

function QuestionScreen({ level, levelIndex, onAnswer, error }) {
  const [selected, setSelected] = useState(null)
  const [sending, setSending] = useState(false)

  const handleSelect = async (i) => {
    if (selected !== null || sending) return
    setSelected(i)
    setSending(true)
    await onAnswer(i)
    setSending(false)
  }

  return (
    <div className="phone-question">
      <div className="phone-level-badge">
        Livello {levelIndex + 1} · {level.phase}
      </div>

      <article className="panel phone-question__card">
        <p className="phone-question__prompt">{level.question}</p>

        <div className="phone-choices">
          {level.choices.map((choice, i) => (
            <button
              key={i}
              className={'phone-choice' + (selected === i ? ' phone-choice--selected' : '')}
              onClick={() => handleSelect(i)}
              disabled={selected !== null || sending}
            >
              <span className="phone-choice__letter">{LETTERS[i]}</span>
              {choice}
            </button>
          ))}
        </div>
      </article>

      {error && error !== 'ROOM_GONE' && <div className="error-box">{error}</div>}
    </div>
  )
}

function AnsweredScreen({ choiceText }) {
  return (
    <div className="phone-answered">
      <div className="phone-answered__icon">
        <CheckCircle size={32} strokeWidth={1.5} />
      </div>
      <h2 className="phone-answered__title">Risposta inviata.</h2>
      <p className="phone-answered__subtitle">
        Hai scelto: <strong>&ldquo;{choiceText}&rdquo;</strong>
      </p>
      <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-base)' }}>
        In attesa della prossima domanda…
      </p>
      <div className="pulse-dot"><span /><span /><span /></div>
    </div>
  )
}

function EndedScreen() {
  return (
    <div className="phone-ended">
      <Quote size={48} color="var(--color-accent)" strokeWidth={1.5} />
      <p className="phone-ended__text">
        Odio gli indifferenti.<br />
        L&apos;indifferenza è abulia,<br />
        è parassitismo,<br />
        è vigliaccheria,<br />
        Non è vita.<br />
        L&apos;indifferenza è il peso morto della storia.<br />
        È la materia bruta che strozza l&apos;intelligenza.<br />
        Perciò odio gli indifferenti.
      </p>
      <p className="phone-ended__author">— A. Gramsci</p>
    </div>
  )
}

// ─── Top bar ──────────────────────────────────────────────────────────────────

function PhoneTopBar({ roomCode, levelIndex }) {
  return (
    <header className="phone-topbar">
      <div className="brand">
        <LogoIcon size={28} style={{ color: 'var(--color-primary)' }} />
        <div><h1>Leonardo Campaign</h1></div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '.15rem' }}>
        {roomCode && (
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)', fontWeight: 700, letterSpacing: '.06em' }}>
            {roomCode}
          </span>
        )}
        {levelIndex !== undefined && (
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
            Livello {levelIndex + 1}/6
          </span>
        )}
      </div>
    </header>
  )
}
