import { parties, SEAT_COUNT } from '@/data'
import { groupsFrom, HEMICYCLE, SEAT_RADIUS, seatPoints } from '@/hemicycle'

type CardInput = {
  brand: string
  title: string
  subtitle: string
  seats: Record<string, number>
  names: Record<string, string>
  label: string
  sub: string
  lines: string[]
}

function color(name: string, fallback: string) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value || fallback
}

function fit(context: CanvasRenderingContext2D, text: string, max: number) {
  if (context.measureText(text).width <= max) return text
  let next = text
  while (next.length > 1 && context.measureText(`${next}…`).width > max) next = next.slice(0, -1)
  return `${next}…`
}

export async function downloadResultCard(input: CardInput) {
  if (document.fonts?.ready) await document.fonts.ready
  const ranked = parties.filter((party) => (input.seats[party.id] ?? 0) > 0).slice().sort((a, b) => (input.seats[b.id] ?? 0) - (input.seats[a.id] ?? 0))
  const width = 1080
  const hemiScale = 560 / HEMICYCLE.width
  const hemiHeight = HEMICYCLE.height * hemiScale
  const rowHeight = 46
  const height = 250 + hemiHeight + Math.ceil(ranked.length / 2) * rowHeight + input.lines.length * 40 + 120
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) return
  const ink = color('--foreground', '#151a2b')
  const muted = color('--muted-foreground', '#525a70')
  const card = color('--card', '#ffffff')
  const page = color('--background', '#eef0f5')
  const accent = color('--primary', '#2a3fd0')
  context.fillStyle = page
  context.fillRect(0, 0, width, height)
  context.fillStyle = card
  context.beginPath()
  if (context.roundRect) context.roundRect(36, 36, width - 72, height - 72, 28)
  else context.rect(36, 36, width - 72, height - 72)
  context.fill()
  context.fillStyle = accent
  context.beginPath()
  context.arc(100, 108, 22, Math.PI, 0)
  context.fill()
  context.textBaseline = 'alphabetic'
  context.textAlign = 'left'
  context.direction = 'ltr'
  context.fillStyle = muted
  context.font = '800 22px Unbounded, "Golos Text", sans-serif'
  context.fillText(fit(context, input.brand, width - 180), 136, 112)
  context.fillStyle = ink
  context.font = '800 48px Unbounded, "Golos Text", sans-serif'
  context.fillText(fit(context, input.title, width - 160), 72, 190)
  context.fillStyle = muted
  context.font = '500 24px "Golos Text", sans-serif'
  context.fillText(fit(context, input.subtitle, width - 160), 72, 230)

  const originX = (width - HEMICYCLE.width * hemiScale) / 2
  const originY = 270
  const assigned: { color: string }[] = []
  for (const group of groupsFrom(input.seats)) {
    for (let index = 0; index < group.seats && assigned.length < seatPoints.length; index += 1) {
      assigned.push({ color: group.color })
    }
  }
  const empty = color('--muted', '#d3d8e3')
  seatPoints.forEach((point, index) => {
    context.beginPath()
    context.arc(originX + point.x * hemiScale, originY + point.y * hemiScale, SEAT_RADIUS * hemiScale, 0, Math.PI * 2)
    context.fillStyle = assigned[index]?.color ?? empty
    context.fill()
  })
  context.textAlign = 'center'
  context.fillStyle = ink
  context.font = '800 54px Unbounded, "Golos Text", sans-serif'
  context.fillText(input.label, width / 2, originY + HEMICYCLE.labelY * hemiScale + 16)
  context.fillStyle = muted
  context.font = '500 22px "Golos Text", sans-serif'
  context.fillText(input.sub, width / 2, originY + HEMICYCLE.labelY * hemiScale + 48)

  const listTop = originY + hemiHeight + 36
  const column = (width - 160 - 36) / 2
  context.textAlign = 'left'
  ranked.forEach((party, index) => {
    const x = 72 + (index % 2) * (column + 36)
    const y = listTop + Math.floor(index / 2) * rowHeight
    const seats = input.seats[party.id] ?? 0
    context.fillStyle = party.color
    context.beginPath()
    context.arc(x + 12, y - 8, 12, 0, Math.PI * 2)
    context.fill()
    context.font = '800 26px Unbounded, "Golos Text", sans-serif'
    const count = String(seats)
    const countWidth = context.measureText(count).width
    context.font = '500 18px "Golos Text", sans-serif'
    const share = `${((seats / SEAT_COUNT) * 100).toFixed(1).replace('.', ',')}%`
    const shareWidth = context.measureText(share).width
    context.fillStyle = ink
    context.font = '600 24px "Golos Text", sans-serif'
    context.fillText(fit(context, input.names[party.id] ?? party.name, column - 40 - countWidth - shareWidth - 24), x + 34, y)
    context.textAlign = 'right'
    context.fillStyle = muted
    context.font = '500 18px "Golos Text", sans-serif'
    context.fillText(share, x + column, y)
    context.fillStyle = ink
    context.font = '800 26px Unbounded, "Golos Text", sans-serif'
    context.fillText(count, x + column - shareWidth - 12, y)
    context.textAlign = 'left'
  })

  let lineY = listTop + Math.ceil(ranked.length / 2) * rowHeight + 20
  context.fillStyle = color('--border', '#d3d8e3')
  context.fillRect(72, lineY, width - 144, 2)
  lineY += 40
  context.fillStyle = ink
  context.font = '500 24px "Golos Text", sans-serif'
  for (const line of input.lines) {
    context.fillText(fit(context, line, width - 144), 72, lineY)
    lineY += 36
  }

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
  if (!blob) return
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'knesset-2026.png'
  document.body.appendChild(link)
  link.click()
  setTimeout(() => {
    URL.revokeObjectURL(url)
    link.remove()
  }, 800)
}
