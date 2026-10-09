import { partyById } from '@/data'

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
  const placed: { x0: number; y: number; x1: number }[] = []

  const dots = parties.map((party) => {
    const meta = partyById(party.id)
    return { ...party, name: meta.name, color: meta.color, px: map(party.x), py: map(-party.y) }
  })
  const you = user ? { px: map(user.x), py: map(-user.y) } : null

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
      {dots.map((dot) => {
        const text = dot.name.length > 18 ? `${dot.name.slice(0, 17)}…` : dot.name
        const width = text.length * 5.4 + 6
        const left = dot.px > size * 0.62
        const x0 = left ? dot.px - 12 - width : dot.px + 12
        let y = dot.py + 3
        for (let attempt = 0; attempt < 6 && placed.some((box) => Math.abs(box.y - y) < 11 && x0 < box.x1 && x0 + width > box.x0); attempt += 1) {
          y += 11
        }
        placed.push({ x0, y, x1: x0 + width })
        return (
          <g key={dot.id}>
            <circle cx={dot.px} cy={dot.py} r={6.5} fill={dot.color} stroke="var(--card)" strokeWidth={1.5}>
              <title>{dot.name}</title>
            </circle>
            <text x={left ? dot.px - 10 : dot.px + 10} y={y} textAnchor={left ? 'end' : 'start'} fill="currentColor" style={{ fontSize: 10 }}>
              {text}
            </text>
          </g>
        )
      })}
      {you && (
        <g>
          <circle cx={you.px} cy={you.py} r={8} fill="var(--card)" stroke="currentColor" strokeWidth={3} />
          <text x={you.px + 12} y={you.py + 4} fill="currentColor" style={{ fontSize: 12, fontWeight: 700 }}>
            Вы
          </text>
        </g>
      )}
    </svg>
  )
}
