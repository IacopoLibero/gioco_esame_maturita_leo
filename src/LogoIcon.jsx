export default function LogoIcon({ size = 42, className = '', style }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      {/* Dashed cross lines */}
      <path d="M28.6794,24h-2.15" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M32.3471,24h-2.15" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M36.0147,24h-2.15" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M39.6824,24h-2.15" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21.4706,24h-2.15" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17.8029,24h-2.15" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14.1353,24h-2.15" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10.4676,24h-2.15" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M24,15.6529v2.15" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M24,19.3206v2.15" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M24,26.5294v2.15" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M24,30.1971v2.15" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M24,33.8647v2.15" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M24,37.5324v2.15" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M24,11.9853v2.15" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M24,8.3176v2.15" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Spiral curve */}
      <path d="M10.3412,20.7118c21.7529-22.1324,15.1764,12.9,27.5706,15.6823" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Outer circle */}
      <circle cx="24" cy="24" r="21.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Center dot */}
      <circle cx="24" cy="24" r="0.75" fill="currentColor"/>
    </svg>
  )
}
