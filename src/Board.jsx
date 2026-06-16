'use client'
import { useState, useEffect } from 'react'
import QRCode from 'react-qr-code'
import { ArrowRight, RotateCcw, HelpCircle, Clock, Smartphone, Users, Quote } from 'lucide-react'
import LogoIcon from './LogoIcon'
import { useGameState } from './useGameState'
import { levels } from './content'

const LETTERS = ['A', 'B', 'C']

// ─── Board root ───────────────────────────────────────────────────────────────

export default function Board() {
  const [roomCode, setRoomCode] = useState(null)
  const [initError, setInitError] = useState(null)

  useEffect(() => {
    const savedCode = sessionStorage.getItem('boardRoomCode') || undefined
    fetch('/api/room', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ savedRoomCode: savedCode }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.roomCode) {
          setRoomCode(data.roomCode)
          sessionStorage.setItem('boardRoomCode', data.roomCode)
        } else {
          setInitError(data.error || 'Impossibile creare la stanza')
        }
      })
      .catch(() => setInitError('Errore di rete. Ricarica la pagina.'))
  }, [])

  const { state, error, doAction } = useGameState(roomCode, null)

  if (initError) return <StateScreen message={initError} />
  if (!roomCode || !state) return <StateScreen message="Inizializzazione stanza…" loading />

  const phoneUrl = `${window.location.origin}/?room=${roomCode}`

  const handleRestart = async () => {
    const data = await doAction('restart')
    if (data?.roomCode) {
      setRoomCode(data.roomCode)
      sessionStorage.setItem('boardRoomCode', data.roomCode)
    }
  }

  if (state.status === 'waiting') {
    return (
      <WaitingScreen
        state={state}
        phoneUrl={phoneUrl}
        onStart={() => doAction('advance')}
        error={error}
      />
    )
  }
  if (state.status === 'ended') {
    return <EndedScreen />
  }
  return (
    <PlayingScreen
      state={state}
      onAdvance={() => doAction('advance')}
      onRestart={handleRestart}
      error={error}
    />
  )
}

// ─── Waiting screen ───────────────────────────────────────────────────────────

function WaitingScreen({ state, phoneUrl, onStart, error }) {
  return (
    <div className="board-layout">
      <BoardTopBar>
        <div className="status-bar">
          <span className="status-dot status-dot--connected" />
          <span>Lavagna attiva · codice stanza</span>
          <strong style={{ color: 'var(--color-primary)' }}>{state.roomCode}</strong>
        </div>
      </BoardTopBar>

      <div className="board-waiting">
        <article className="panel board-waiting__left">
          <span className="eyebrow">Campagna orale · 6 livelli · ~10 minuti</span>

          <h2 className="board-waiting__title">Dalla corsia alla scelta di chi diventare.</h2>

          <p className="board-waiting__subtitle">
            Un gioco narrativo che trasforma il percorso scolastico di Leonardo in una campagna
            interattiva. Ogni livello corrisponde a un passaggio reale del liceo e contiene una
            sola domanda da rivolgere alla commissione.
          </p>

          <div className="phone-count">
            <Users size={28} color="var(--color-primary)" strokeWidth={1.5} />
            <span className="phone-count__number">{state.phoneCount}</span>
            <div>
              <div className="phone-count__label">
                {state.phoneCount === 1 ? 'telefono collegato' : 'telefoni collegati'}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                {state.phoneCount === 0 ? 'In attesa di partecipanti…' : 'Pronti a giocare'}
              </div>
            </div>
          </div>

          {error && <div className="error-box">{error}</div>}

          <button className="btn btn--primary btn--large" onClick={onStart}>
            Avvia il gioco <ArrowRight size={20} />
          </button>
        </article>

        <aside className="panel board-waiting__right">
          <div className="room-code-display">
            <div className="room-code-display__label">Scansiona per partecipare</div>
            <div className="room-code-display__code">{state.roomCode}</div>
            <div className="room-code-display__url">{phoneUrl}</div>
          </div>

          <div className="qr-wrapper">
            <QRCode value={phoneUrl} size={200} />
          </div>

          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textAlign: 'center', maxWidth: 240 }}>
            Ogni partecipante inquadra il QR code, si collega automaticamente e aspetta la prima domanda.
          </p>
        </aside>
      </div>
    </div>
  )
}

// ─── Playing screen ───────────────────────────────────────────────────────────

function PlayingScreen({ state, onAdvance, onRestart, error }) {
  const level = levels[state.currentLevel]
  const answers = state.answers || []
  const totalAnswers = answers.length

  const votes = [0, 0, 0]
  answers.forEach(a => { if (a.choiceIndex >= 0 && a.choiceIndex <= 2) votes[a.choiceIndex]++ })

  const isLastLevel = state.currentLevel === levels.length - 1

  return (
    <div className="board-layout">
      <BoardTopBar>
        <div className="level-progress">
          {levels.map((_, i) => (
            <div
              key={i}
              className={
                'level-pip' +
                (i < state.currentLevel ? ' level-pip--done' : '') +
                (i === state.currentLevel ? ' level-pip--active' : '')
              }
            />
          ))}
        </div>
        <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center' }}>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '.35rem' }}>
            <Smartphone size={14} />
            {state.phoneCount}
          </span>
          <button
            className="btn"
            onClick={onRestart}
            style={{ fontSize: 'var(--text-sm)', minHeight: 36, padding: '.4rem 1rem', display: 'flex', alignItems: 'center', gap: '.4rem' }}
          >
            <RotateCcw size={14} /> Ricomincia
          </button>
        </div>
      </BoardTopBar>

      <div className="board-playing">
        <article className="panel board-story">
          <div className="board-story__meta">
            <div>
              <div className="level-tag">Livello {state.currentLevel + 1} · {level.phase}</div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>{level.years}</div>
            </div>
            <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
              Missione {state.currentLevel + 1} di {state.totalLevels}
            </div>
          </div>

          <h2 className="board-story__title">{level.title}</h2>

          <p className="board-story__text">{level.text1}</p>
          <p className="board-story__text">{level.text2}</p>

          <div className="tags">
            {level.tags.map(t => <span key={t} className="tag">{t}</span>)}
          </div>

          <div className="board-question">
            <strong className="board-question__prompt">
              <HelpCircle size={18} strokeWidth={2} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '.4rem' }} />
              {level.question}
            </strong>
            <ol className="choices-list">
              {level.choices.map((c, i) => (
                <li key={i}>
                  <span className="choice-letter">{LETTERS[i]}</span>
                  {c}
                </li>
              ))}
            </ol>
          </div>

          <div className="board-nav">
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
              {totalAnswers} {totalAnswers === 1 ? 'risposta ricevuta' : 'risposte ricevute'}
              {state.phoneCount > 0 && ` su ${state.phoneCount} telefoni`}
            </span>
            {error && <div className="error-box" style={{ margin: 0 }}>{error}</div>}
            <button className="btn btn--primary btn--large" onClick={onAdvance} style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
              {isLastLevel ? 'Mostra finale' : 'Livello successivo'} <ArrowRight size={20} />
            </button>
          </div>
        </article>

        <aside className="panel board-answers">
          <div className="answers-header">
            <h4>Risposte in tempo reale</h4>
            <span className="answers-count">{totalAnswers}/{state.phoneCount || '–'}</span>
          </div>

          {totalAnswers === 0 ? (
            <div className="no-answers">
              <Clock size={28} color="var(--color-text-muted)" strokeWidth={1.5} style={{ marginBottom: '.5rem' }} />
              <div>In attesa delle risposte…</div>
              {state.phoneCount === 0 && (
                <div style={{ marginTop: '.5rem', fontSize: 'var(--text-xs)' }}>
                  Nessun telefono connesso.<br />La lavagna funziona in autonomia.
                </div>
              )}
            </div>
          ) : (
            <div className="answer-bars">
              {level.choices.map((choice, i) => {
                const count = votes[i]
                const pct = totalAnswers > 0 ? Math.round((count / totalAnswers) * 100) : 0
                return (
                  <div key={i} className="answer-bar">
                    <div className="answer-bar__label">
                      <span className="answer-bar__text">
                        <strong>{LETTERS[i]}.</strong> {choice}
                      </span>
                      <span className="answer-bar__count">{count}</span>
                    </div>
                    <div className="answer-bar__track">
                      <div className="answer-bar__fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

// ─── Ended screen ─────────────────────────────────────────────────────────────

function EndedScreen() {
  const [showFinal, setShowFinal] = useState(false)

  if (showFinal) {
    return (
      <div className="board-ended board-ended--fullscreen">
          <article className="panel board-ended__card board-ended__card--quote">
            <Quote size={40} color="var(--color-accent)" strokeWidth={1.5} />
            <blockquote className="board-gramsci board-gramsci--large">
              <p>
                Odio gli indifferenti.<br />
                L&apos;indifferenza è abulia,<br />
                è parassitismo,<br />
                è vigliaccheria,<br />
                Non è vita.<br />
                L&apos;indifferenza è il peso morto della storia.<br />
                È la materia bruta che strozza l&apos;intelligenza.<br />
                Perciò odio gli indifferenti.
              </p>
              <footer>— A. Gramsci</footer>
            </blockquote>
          </article>
      </div>
    )
  }

  return (
    <div className="board-layout">
      <BoardTopBar />
      <div className="board-ended">
        <article className="panel board-ended__card">
          <span className="eyebrow">Boss fight superata</span>
          <h2 className="board-ended__title">Il vero risultato è sapere chi sei diventato.</h2>
          <p className="board-ended__text">
            L&apos;eroe che racconta questa campagna sta affrontando proprio adesso la sua ultima
            sfida: l&apos;esame di maturità. Tutte le missioni precedenti — sport, tutoraggio,
            attività civiche, olimpiadi, interessi umanistici — convergono in questo momento.
          </p>
          <p className="board-ended__text">
            Il premio finale non è soltanto il voto, ma la consapevolezza di chi si è diventati.
          </p>
          <button className="btn btn--primary" onClick={() => setShowFinal(true)} style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
            Fine <ArrowRight size={18} />
          </button>
        </article>
      </div>
    </div>
  )
}

// ─── Shared ───────────────────────────────────────────────────────────────────

function BoardTopBar({ children }) {
  return (
    <header className="board-topbar">
      <div className="brand">
        <LogoIcon size={42} className="brand__logo" />
        <div>
          <h1>Leonardo Campaign</h1>
          <p>Gioco narrativo · maturità 2026 Leonardo Nullo Bernabei</p>
        </div>
      </div>
      <div className="board-topbar-right">{children}</div>
    </header>
  )
}

function StateScreen({ message, loading }) {
  return (
    <div className="state-screen">
      {loading && <div className="pulse-dot"><span /><span /><span /></div>}
      <p>{message}</p>
    </div>
  )
}
