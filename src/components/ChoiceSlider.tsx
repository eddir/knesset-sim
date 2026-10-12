import { useRef } from 'react'
import { useI18n } from '@/i18n'
import { snapSlider } from '@/quiz'

const TICKS = [-1, -0.5, 0, 0.5, 1]

function sliderText(value: number | null, a: string, b: string, t: {
  sliderUnset: string
  sliderMid: string
  sliderSlight: (side: string) => string
  sliderClear: (side: string) => string
  sliderFull: (side: string) => string
}) {
  if (value === null) return t.sliderUnset
  const size = Math.abs(value)
  if (size < 0.08) return t.sliderMid
  const side = value < 0 ? a : b
  if (size < 0.4) return t.sliderSlight(side)
  if (size < 0.8) return t.sliderClear(side)
  return t.sliderFull(side)
}

export function ChoiceSlider({
  title,
  left,
  right,
  value,
  onChange,
}: {
  title: string
  left: string
  right: string
  value: number | null
  onChange: (value: number) => void
}) {
  const { t } = useI18n()
  const trackRef = useRef<HTMLDivElement>(null)
  const drag = useRef(false)
  const shown = value === null ? 0 : value
  const x = ((shown + 1) / 2) * 100
  const hotLeft = value !== null && value <= -0.08
  const hotRight = value !== null && value >= 0.08

  function fromClient(clientX: number) {
    const rect = trackRef.current?.getBoundingClientRect()
    if (!rect || rect.width <= 0) return 0
    return snapSlider(((clientX - rect.left) / rect.width) * 2 - 1)
  }

  return (
    <div dir="ltr">
      <div className="poles">
        <button type="button" className={`pole l${hotLeft ? ' on' : ''}`} style={{ ['--o' as string]: value === null || shown <= 0.08 ? 1 : Math.max(0.45, 1 - shown * 0.6) }} onClick={() => onChange(-0.85)}>
          <em>A</em>
          <span>{left}</span>
        </button>
        <button type="button" className={`pole r${hotRight ? ' on' : ''}`} style={{ ['--o' as string]: value === null || shown >= -0.08 ? 1 : Math.max(0.45, 1 + shown * 0.6) }} onClick={() => onChange(0.85)}>
          <em>B</em>
          <span>{right}</span>
        </button>
      </div>
      <div
        ref={trackRef}
        className={`track${value !== null ? ' set' : ''}`}
        onPointerDown={(event) => {
          drag.current = true
          event.currentTarget.setPointerCapture(event.pointerId)
          onChange(fromClient(event.clientX))
        }}
        onPointerMove={(event) => {
          if (drag.current) onChange(fromClient(event.clientX))
        }}
        onPointerUp={() => { drag.current = false }}
        onPointerCancel={() => { drag.current = false }}
      >
        <div className="rail" />
        {TICKS.map((tick) => (
          <div key={tick} className={`tick${tick === 0 ? ' c' : ''}`} style={{ left: `${((tick + 1) / 2) * 100}%` }} />
        ))}
        <div className="fill" style={{ left: `${Math.min(50, x)}%`, width: `${Math.abs(x - 50)}%` }} />
        <div
          className="ball"
          role="slider"
          tabIndex={0}
          aria-valuemin={-100}
          aria-valuemax={100}
          aria-valuenow={Math.round(shown * 100)}
          aria-valuetext={sliderText(value, left, right, t)}
          aria-label={title}
          style={{ left: `${x}%` }}
          onKeyDown={(event) => {
            const current = value ?? 0
            const step = event.shiftKey ? 0.25 : 0.1
            if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
              event.preventDefault()
              onChange(snapSlider(current - step))
            } else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
              event.preventDefault()
              onChange(snapSlider(current + step))
            } else if (event.key === 'Home') {
              event.preventDefault()
              onChange(-1)
            } else if (event.key === 'End') {
              event.preventDefault()
              onChange(1)
            }
          }}
        />
      </div>
      <div className="val">{sliderText(value, left, right, t)}</div>
    </div>
  )
}
