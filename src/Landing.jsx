'use client'

export default function Landing() {
  return (
    <div className="landing">
      <svg className="landing__logo" width="64" height="64" viewBox="0 0 64 64" fill="none">
        <path d="M10 37C18 27 27 20 36 15C40 13 46 12 51 15C45 18 40 22 37 27C33 33 31 39 28 46C25 52 20 54 12 49C18 47 21 44 23 40C18 42 14 41 10 37Z" fill="currentColor" opacity=".2"/>
        <path d="M12 38C20 28 28 22 39 16" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
        <path d="M24 39C31 35 39 35 50 38" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
        <circle cx="50" cy="38" r="4" fill="currentColor"/>
      </svg>

      <div>
        <h1>Leonardo Campaign</h1>
        <p>Gioco narrativo multi-device per il colloquio di maturità</p>
      </div>

      <p>
        Apri la <strong>lavagna</strong> su PC o proiettore, poi fai scansionare il QR code ai
        partecipanti per farli rispondere dal proprio telefono.
      </p>

      <div className="landing__actions">
        <a href="/?board" className="btn btn--primary btn--large" style={{ textDecoration: 'none', justifyContent: 'center' }}>
          Apri Lavagna
        </a>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
          oppure scansiona il QR code della lavagna con il telefono
        </p>
      </div>
    </div>
  )
}
