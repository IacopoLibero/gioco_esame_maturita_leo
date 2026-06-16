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

      <blockquote className="landing__quote">
        <p>
          "L'unica costante della vita è il cambiamento"<br />
          
        </p>
        <footer>— Buddha</footer>
      </blockquote>

      <div className="landing__actions">
        <a href="/?board" className="btn btn--primary btn--large" style={{ textDecoration: 'none', justifyContent: 'center' }}>
          Apri Lavagna
        </a>
      </div>
    </div>
  )
}
