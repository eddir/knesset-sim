import { parties } from '@/data'

const RINGS = [6, 8, 11, 13, 15, 16, 17, 17, 17]

type Point = { x: number; y: number; angle: number; ring: number }

const points: Point[] = (() => {
  const next: Point[] = []
  RINGS.forEach((count, ring) => {
    const radius = 118 + ring * 20
    for (let index = 0; index < count; index += 1) {
      const t = count === 1 ? 0.5 : index / (count - 1)
      const angle = Math.PI * (1 - t)
      next.push({
        angle,
        ring,
        x: 310 + Math.cos(angle) * radius,
        y: 318 - Math.sin(angle) * radius,
      })
    }
  })
  next.sort((a, b) => a.angle - b.angle || a.ring - b.ring)
  return next
})()

export type SeatGroup = { id: string; name: string; color: string; seats: number }

export function groupsFrom(seats: Record<string, number>): SeatGroup[] {
  return parties
    .filter((party) => (seats[party.id] ?? 0) > 0)
    .slice()
    .sort((a, b) => a.lr - b.lr)
    .map((party) => ({ id: party.id, name: party.name, color: party.color, seats: seats[party.id] }))
}

export function Hemicycle({
  groups,
  activeId,
  onPick,
  label,
  sub,
}: {
  groups: SeatGroup[]
  activeId?: string | null
  onPick?: (id: string) => void
  label: string
  sub: string
}) {
  const assigned: { id: string; color: string; name: string }[] = []
  for (const group of groups) {
    for (let index = 0; index < group.seats; index += 1) {
      assigned.push({ id: group.id, color: group.color, name: group.name })
    }
  }
  while (assigned.length < points.length) assigned.push({ id: '', color: 'var(--muted)', name: '' })

  return (
    <div className="relative">
    <svg viewBox="0 0 620 348" role="img" aria-label={`${label}, ${sub}`} className="w-full">
      {points.map((point, index) => {
        const seat = assigned[index]
        const dim = Boolean(activeId) && seat.id !== activeId
        return (
          <circle
            key={`${point.x}-${point.y}`}
            cx={point.x}
            cy={point.y}
            r={8}
            fill={seat.color}
            opacity={dim ? 0.22 : 1}
            stroke={seat.color === '#171717' ? '#A8A29E' : 'var(--card)'}
            strokeWidth={1.6}
            className={onPick && seat.id ? 'cursor-pointer' : undefined}
            onClick={() => seat.id && onPick?.(seat.id)}
          >
            <title>{seat.name}</title>
          </circle>
        )
      })}
    </svg>
    <div className="pointer-events-none absolute inset-x-0 top-[64%] flex justify-center">
      <div className="font-heading w-fit bg-card/80 px-2 text-4xl leading-none">{label}</div>
    </div>
    </div>
  )
}

export function StackedBar({ seats }: { seats: Record<string, number> }) {
  const groups = groupsFrom(seats)
  const total = groups.reduce((sum, group) => sum + group.seats, 0) || 1
  return (
    <div className="flex h-3 overflow-hidden rounded-full bg-muted" aria-hidden>
      {groups.map((group) => (
        <div key={group.id} style={{ width: `${(group.seats / total) * 100}%`, background: group.color }} title={`${group.name}: ${group.seats}`} />
      ))}
    </div>
  )
}
