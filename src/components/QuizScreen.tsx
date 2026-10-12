import { useEffect, useState, type RefObject } from 'react'
import { ChoiceSlider } from '@/components/ChoiceSlider'
import { questions, themes } from '@/data'
import { questionText, themeText, useI18n } from '@/i18n'
import { seatBudget, type Answers, type Weights } from '@/model'
import { snapSlider } from '@/quiz'

const KEYS = ['1', '2', '3', '4', '5']
const SNAPS = [-1, -0.5, 0, 0.5, 1]

export function QuizScreen({
  index,
  list,
  order,
  weights,
  answers,
  headingRef,
  onAnswer,
  onBack,
}: {
  index: number
  list: typeof questions
  order: string[]
  weights: Weights
  answers: Answers
  headingRef: RefObject<HTMLHeadingElement | null>
  onAnswer: (value: number | null) => void
  onBack: () => void
}) {
  const { t, locale } = useI18n()
  const question = list[index]
  const saved = question && question.id in answers ? answers[question.id] : undefined
  const savedValue = typeof saved === 'number' ? saved : null
  const [slot, setSlot] = useState(question?.id)
  const [draft, setDraft] = useState<number | null>(savedValue)
  if (question && slot !== question.id) {
    setSlot(question.id)
    setDraft(savedValue)
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.repeat || event.defaultPrevented) return
      if (document.querySelector('[role="dialog"]')) return
      const target = event.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return
      const snap = KEYS.indexOf(event.key)
      if (snap >= 0) {
        event.preventDefault()
        setDraft(SNAPS[snap])
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        if (target?.getAttribute('role') === 'slider') return
        event.preventDefault()
        setDraft((current) => snapSlider((current ?? 0) + (event.key === 'ArrowRight' ? 0.1 : -0.1)))
      } else if (event.key === 'Enter') {
        event.preventDefault()
        if (draft !== null) onAnswer(draft)
      } else if (event.key === '0') {
        event.preventDefault()
        onAnswer(null)
      } else if (event.key === 'Backspace') {
        event.preventDefault()
        onBack()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [onAnswer, onBack, draft])

  if (!question) return null
  const copy = questionText(locale, question.id)
  const theme = themeText(locale, question.theme)
  const swatch = themes.find((item) => item.id === question.theme)?.color
  const inSection = list.filter((item) => item.theme === question.theme)
  const localIndex = inSection.indexOf(question)
  const place = Math.max(0, order.indexOf(question.theme))
  const stake = seatBudget(weights, order.slice(0, place + 1)) - seatBudget(weights, order.slice(0, place))

  return (
    <div className="narrow">
      <div className="prog" aria-hidden="true">
        {list.map((item, itemIndex) => {
          const value = answers[item.id]
          let mark = itemIndex === index ? 'cur' : value === null ? 'skip' : value !== undefined ? 'done' : ''
          if (itemIndex && item.theme !== list[itemIndex - 1].theme) mark += ' gap'
          return <i key={item.id} className={mark} />
        })}
      </div>
      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <i className="size-2.5 rounded-full" style={{ background: swatch }} />
        <b className="text-foreground">{theme.name}</b>
        <span className="pill">{t.questionOf(localIndex + 1, inSection.length)}</span>
        {stake > 0 && <span className="pill">{t.seatsAtStake(stake)}</span>}
      </div>
      <h1 ref={headingRef} tabIndex={-1} className="qtitle font-heading font-semibold outline-none">{copy.title}</h1>
      <div className="mt-5">
        <ChoiceSlider title={copy.title} left={copy.a} right={copy.b} value={draft} onChange={setDraft} />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <button type="button" className="cta" disabled={draft === null} onClick={() => draft !== null && onAnswer(draft)}>{t.next}</button>
        <button type="button" className="quiet" onClick={onBack}>{t.back}</button>
        <button type="button" className="quiet" onClick={() => onAnswer(null)}>{t.skip}</button>
      </div>
      <p className="mt-3 text-[11.5px] text-[var(--ink3)] max-sm:hidden">{t.keysHint}</p>
    </div>
  )
}
