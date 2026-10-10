import { partyById } from '@/data'
import { placeCompassLabels } from '@/compassLayout'

export function Compass({
  user,
  parties,
}: {
  user: { x: number; y: number } | null
  parties: { id: string; x: number; y: number }[]
}) {
  const size = 360
  const pad = 36
  const map = (value: number) => pad + ((Math.max(-1, Math.min(1, value)) + 1) / 2) * (size - pad * 2)

  const dots = parties.map((party) => {
    const meta = partyById(party.id)
    return { id: party.id, name: meta.name, color: meta.color, px: map(party.x), py: map(-party.y) }
  })
  const you = user ? { px: map(user.x), py: map(-user.y) } : null
  const labels = placeCompassLabels(dots, you, size)

  return (
    <svg viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Политические координаты" className="w-full max-w-md">
      <rect x={pad} y={pad} width={size - pad * 2} height={size - pad * 2} fill="var(--muted)" stroke="var(--border)" />
      <line x1={size / 2} y1={pad} x2={size / 2} y2={size - pad} stroke="var(--border)" />
      <line x1={pad} y1={size / 2} x2={size - pad} y2={size / 2} stroke="var(--border)" />
      <text x={size / 2} y={16} textAnchor="middle" fill="currentColor" opacity={0.7} style={{ fontSize: 11 }}>
        Светские институты
      </text>
      <text x={size / 2} y={size - 8} textAnchor="middle" fill="currentColor" opacity={0.7} style={{ fontSize: 11 }}>
        Раввинат и большинство
      </text>
      <text x={8} y={size / 2} textAnchor="middle" fill="currentColor" opacity={0.7} style={{ fontSize: 11 }} transform={`rotate(-90 8 ${size / 2})`}>
        Сила и территория
      </text>
      <text x={size - 8} y={size / 2} textAnchor="middle" fill="currentColor" opacity={0.7} style={{ fontSize: 11 }} transform={`rotate(90 ${size - 8} ${size / 2})`}>
        Сделка и гражданское
      </text>
      {dots.map((dot) => (
        <circle key={dot.id} cx={dot.px} cy={dot.py} r={6.5} fill={dot.color} stroke="var(--card)" strokeWidth={1.5}>
          <title>{dot.name}</title>
        </circle>
      ))}
      {labels.filter((label) => label.id !== 'user').map((label) => (
        <text key={label.id} x={label.x} y={label.y} textAnchor={label.anchor} fill="currentColor" style={{ fontSize: 10, fontWeight: 500 }}>
          {label.text}
        </text>
      ))}
      {you && <circle cx={you.px} cy={you.py} r={8} fill="var(--card)" stroke="currentColor" strokeWidth={3} />}
      {labels.filter((label) => label.id === 'user').map((label) => (
        <text key={label.id} x={label.x} y={label.y} textAnchor={label.anchor} fill="currentColor" style={{ fontSize: 12, fontWeight: 700 }}>
          {label.text}
        </text>
      ))}
    </svg>
  )
}
