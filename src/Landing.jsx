'use client'
import LogoIcon from './LogoIcon'

export default function Landing() {
  return (
    <div className="landing">
      <LogoIcon size={64} className="landing__logo" />

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
