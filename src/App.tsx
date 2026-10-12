import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Compass } from '@/components/Compass'
import { Hemicycle } from '@/components/Hemicycle'
import { BillList, OwnCoalition, ThemeShareList, ThemeStrips, WikiCard } from '@/components/ReportParts'
import { QuizScreen } from '@/components/QuizScreen'
import { SectionBoard } from '@/components/SectionBoard'
import { groupsFrom } from '@/hemicycle'
import {
  blocs,
  MAJORITY,
  parties,
  questions,
  themes,
  weightLevels,
} from '@/data'
import { defaultWeights, formatPct, seatBudget, simulate, type Answers, type SeatResult, type Weights } from '@/model'
import { questionsInOrder, sectionSpan, themeOrder } from '@/quiz'
import { I18nContext, loadLocale, partyAbout, partyLeader, partyName, saveLocale, themeText, ui, postName, useI18n, type Locale } from '@/i18n'
import { downloadResultCard } from '@/resultCard'

type Phase = 'intro' | 'weights' | 'questions' | 'section' | 'results'

type Save = {
  phase: Phase
  weights: Weights
  answers: Answers
  index: number
  order: string[]
  section: string | null
}

const STORAGE = 'knesset-2026-v1'
const weightValues = new Set<number>(weightLevels.map((level) => level.id))
const themeIds = new Set(themes.map((theme) => theme.id))

function loadSave(): Save {
  const empty: Save = { phase: 'intro', weights: defaultWeights(), answers: {}, index: 0, order: themeOrder(defaultWeights()), section: null }
  try {
    const raw = localStorage.getItem(STORAGE)
    if (!raw) return empty
    const data = JSON.parse(raw) as Partial<Save>
    const phase: Phase = data.phase === 'weights' || data.phase === 'questions' || data.phase === 'section' || data.phase === 'results' ? data.phase : 'intro'
    const weights = defaultWeights()
    if (data.weights && typeof data.weights === 'object') {
      for (const theme of themes) {
        const level = data.weights[theme.id]
        if (typeof level === 'number' && weightValues.has(level)) weights[theme.id] = level
      }
    }
    const answers: Answers = {}
    if (data.answers && typeof data.answers === 'object') {
      for (const question of questions) {
        const value = (data.answers as Record<string, unknown>)[question.id]
        if (value === null) answers[question.id] = null
        else if (typeof value === 'number' && Number.isFinite(value) && value >= -1 && value <= 1) answers[question.id] = Math.round(value * 100) / 100
      }
    }
    const storedOrder = Array.isArray(data.order) ? data.order.filter((id): id is string => typeof id === 'string' && themeIds.has(id)) : []
    const order = storedOrder.length ? storedOrder : themeOrder(weights)
    const list = questionsInOrder(order)
    const index = Number.isFinite(data.index) ? Math.round(data.index ?? 0) : 0
    const section = typeof data.section === 'string' && order.includes(data.section) ? data.section : null
    return {
      phase: phase === 'section' && !section ? 'questions' : phase,
      weights,
      answers,
      order,
      section,
      index: Math.max(0, Math.min(Math.max(0, list.length - 1), index)),
    }
  } catch {
    return empty
  }
}

function useTheme() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))
  function toggle() {
    const next = !document.documentElement.classList.contains('dark')
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('knesset-theme', next ? 'dark' : 'light')
    setDark(next)
  }
  return { dark, toggle }
}

export default function App() {
  const [initial] = useState(loadSave)
  const [phase, setPhase] = useState<Phase>(initial.phase)
  const [weights, setWeights] = useState<Weights>(initial.weights)
  const [answers, setAnswers] = useState<Answers>(initial.answers)
  const [index, setIndex] = useState(initial.index)
  const [order, setOrder] = useState<string[]>(initial.order)
  const [sectionId, setSectionId] = useState<string | null>(initial.section)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [locale, setLocaleState] = useState<Locale>(loadLocale)
  const t = ui[locale]
  const theme = useTheme()
  const headingRef = useRef<HTMLHeadingElement>(null)
  const result = useMemo(() => simulate(answers, weights, locale), [answers, weights, locale])
  const list = useMemo(() => questionsInOrder(order), [order])
  const shareKey = parties.map((party) => result.seats[party.id]).join('.')
  const copied = copiedKey === shareKey

  useEffect(() => {
    const save: Save = { phase, weights, answers, index, order, section: sectionId }
    localStorage.setItem(STORAGE, JSON.stringify(save))
  }, [phase, weights, answers, index, order, sectionId])

  useEffect(() => {
    if (!copied) return
    const id = window.setTimeout(() => setCopiedKey(null), 2200)
    return () => window.clearTimeout(id)
  }, [copied])

  useEffect(() => {
    if (phase === 'questions') headingRef.current?.focus()
    window.scrollTo(0, 0)
  }, [phase, index, sectionId])

  useEffect(() => {
    document.documentElement.lang = locale
    document.documentElement.dir = locale === 'he' ? 'rtl' : 'ltr'
    document.title = t.pageTitle
  }, [locale, t.pageTitle])

  function setLocale(next: Locale) {
    setLocaleState(next)
    saveLocale(next)
  }

  const answered = list.filter((question) => question.id in answers).length
  const playable = themeOrder(weights)

  function go(next: Phase) {
    if (next !== 'results') setActiveId(null)
    setPhase(next)
  }

  function begin() {
    const next = themeOrder(weights)
    if (!next.length) return
    setOrder(next)
    setIndex(0)
    setSectionId(null)
    go('questions')
  }

  function reset() {
    setAnswers({})
    setWeights(defaultWeights())
    setIndex(0)
    setOrder(themeOrder(defaultWeights()))
    setSectionId(null)
    setActiveId(null)
    go('intro')
  }

  const backQuestion = useCallback(() => {
    if (index === 0) setPhase('weights')
    else setIndex((current) => current - 1)
  }, [index])

  const commit = useCallback((value: number | null) => {
    const question = list[index]
    if (!question) return
    setAnswers((current) => ({ ...current, [question.id]: value }))
    const upcoming = list[index + 1]
    if (!upcoming || upcoming.theme !== question.theme) {
      setSectionId(question.theme)
      setActiveId(null)
      setPhase('section')
    } else setIndex((current) => current + 1)
  }, [index, list])

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
    <div className="min-h-svh">
      <header className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <button type="button" className="flex items-center gap-2 text-start" onClick={() => go('intro')}>
          <i className="brand-mark" aria-hidden="true" />
          <span>
            <span className="block text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">{t.brandKicker}</span>
            <span className="font-heading text-lg leading-none">{t.brand}</span>
          </span>
        </button>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border p-0.5" role="group" aria-label={t.language}>
            {(['ru', 'en', 'he'] as const).map((code) => (
              <button
                key={code}
                type="button"
                aria-pressed={locale === code}
                onClick={() => setLocale(code)}
                className={`h-7 rounded-md px-2 text-xs font-semibold ${locale === code ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'} ${code === 'he' ? 'font-he' : ''}`}
              >
                {code === 'ru' ? 'RU' : code === 'en' ? 'EN' : 'עב'}
              </button>
            ))}
          </div>
          <MethodDialog />
          <Button type="button" variant="outline" size="icon" aria-label={theme.dark ? t.lightTheme : t.darkTheme} onClick={theme.toggle}>
            {theme.dark ? <Sun /> : <Moon />}
          </Button>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl px-4 pb-20 sm:px-6">
        {phase === 'intro' && <Intro onStart={() => go('weights')} onSkip={begin} />}
        {phase === 'weights' && (
          <Weights
            weights={weights}
            canStart={playable.length > 0}
            onChange={(themeId, level) => setWeights((current) => ({ ...current, [themeId]: level }))}
            onNext={begin}
          />
        )}
        {phase === 'questions' && (
          <QuizScreen
            index={index}
            list={list}
            order={order}
            weights={weights}
            answers={answers}
            headingRef={headingRef}
            onAnswer={commit}
            onBack={backQuestion}
          />
        )}
        {phase === 'section' && sectionId && (
          <SectionView
            order={order}
            sectionId={sectionId}
            answers={answers}
            weights={weights}
            onBack={() => {
              const span = sectionSpan(order, sectionId)
              if (span) setIndex(span.end)
              go('questions')
            }}
            onNext={() => {
              const pos = order.indexOf(sectionId)
              const nextTheme = order[pos + 1]
              if (!nextTheme) {
                setActiveId(null)
                go('results')
                return
              }
              const span = sectionSpan(order, nextTheme)
              setIndex(span?.start ?? 0)
              setSectionId(null)
              go('questions')
            }}
          />
        )}
        {phase === 'results' && (
          <Results
            result={result}
            answers={answers}
            weights={weights}
            answered={answered}
            activeId={activeId}
            onActive={setActiveId}
            copied={copied}
            onCopy={async () => {
              const lines = parties.filter((party) => result.seats[party.id]).map((party) => `${partyName(locale, party.id)} ${result.seats[party.id]}`)
              const text = t.shareText(lines.join(', '), result.verdictTitle)
              try {
                await navigator.clipboard.writeText(text)
                setCopiedKey(shareKey)
              } catch {
                setCopiedKey(null)
              }
            }}
            onEdit={() => { setIndex(Math.max(0, list.length - 1)); go('questions') }}
            onReset={reset}
            onWeight={(themeId, level) => setWeights((current) => {
              const next = { ...current, [themeId]: level }
              if (!themes.some((theme) => next[theme.id] > 0)) return current
              return next
            })}
          />
        )}
      </main>
      <footer className="mx-auto w-full max-w-5xl px-4 pb-10 text-sm text-muted-foreground sm:px-6">
        {t.originalBefore}{' '}
        <a className="font-medium text-primary underline" href="https://bolshoiprikol2.github.io/Duma-Simulator/ru/" target="_blank" rel="noreferrer">{t.originalName}</a>
      </footer>
    </div>
    </I18nContext.Provider>
  )
}

function MethodDialog() {
  const { t } = useI18n()
  return (
    <Dialog>
      <DialogTrigger render={<Button type="button" variant="outline" className="h-8" />}>{t.methodButton}</DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">{t.methodTitle}</DialogTitle>
          <DialogDescription>{t.methodLead}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm leading-relaxed text-foreground">
          {t.methodParas.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Intro({ onStart, onSkip }: { onStart: () => void; onSkip: () => void }) {
  const { t, locale } = useI18n()
  const poll = Object.fromEntries(parties.map((party) => [party.id, party.poll]))
  const right = blocs[0].ids.reduce((sum, id) => sum + (poll[id] ?? 0), 0)
  const change = blocs[1].ids.reduce((sum, id) => sum + (poll[id] ?? 0), 0)
  const groups = groupsFrom(poll).map((group) => ({ ...group, name: partyName(locale, group.id) }))
  return (
    <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_0.95fr]">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.18em] text-primary uppercase">{t.date}</p>
        <h1 className="font-heading mt-3 text-4xl leading-[1.05] font-semibold sm:text-5xl">{t.introTitle}</h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">{t.introLead(questions.length)}</p>
        <dl className="mt-6 grid grid-cols-3 gap-2">
          {[
            ['120', t.seatsShort],
            [locale === 'ru' ? '3,25%' : '3.25%', t.thresholdShort],
            ['61', t.majorityShort],
          ].map(([value, name]) => (
            <div key={name} className="rounded-xl border bg-card px-3 py-3">
              <dt className="font-heading text-2xl leading-none">{value}</dt>
              <dd className="mt-1 text-xs text-muted-foreground">{name}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button type="button" className="h-11 px-5" onClick={onStart}>{t.start}</Button>
          <Button type="button" variant="ghost" className="h-11" onClick={onSkip}>{t.skipToQuestions}</Button>
        </div>
        <p className="mt-4 max-w-xl text-sm text-muted-foreground">{t.pollNow(right, change)}</p>
      </div>
      <figure className="rounded-2xl border bg-card p-3 sm:p-5">
        <Hemicycle groups={groups} label="120" sub={t.hemicycleSub} />
        <figcaption className="px-2 pb-1 text-sm text-muted-foreground">{t.figcaption}</figcaption>
      </figure>
    </div>
  )
}

function SectionView({
  order,
  sectionId,
  answers,
  weights,
  onBack,
  onNext,
}: {
  order: string[]
  sectionId: string
  answers: Answers
  weights: Weights
  onBack: () => void
  onNext: () => void
}) {
  const { t, locale } = useI18n()
  const pos = Math.max(0, order.indexOf(sectionId))
  const done = order.slice(0, pos + 1)
  const prev = simulate(answers, weights, locale, done.slice(0, -1)).seats
  const now = simulate(answers, weights, locale, done).seats
  const awarded = seatBudget(weights, done) - seatBudget(weights, done.slice(0, -1))
  const nextTheme = order[pos + 1]
  return (
    <SectionBoard
      name={themeText(locale, sectionId).name}
      awarded={awarded}
      sectionIndex={pos}
      sectionTotal={order.length}
      prev={prev}
      now={now}
      nextLabel={nextTheme ? t.sectionNext(themeText(locale, nextTheme).name) : t.sectionDone}
      onBack={onBack}
      onNext={onNext}
    />
  )
}

function Weights({
  weights,
  canStart,
  onChange,
  onNext,
}: {
  weights: Weights
  canStart: boolean
  onChange: (themeId: string, level: number) => void
  onNext: () => void
}) {
  const { t, locale } = useI18n()
  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-[11px] font-semibold tracking-[0.18em] text-primary uppercase">{t.step}</p>
      <h1 className="font-heading mt-2 text-3xl font-semibold sm:text-4xl">{t.weightsTitle}</h1>
      <p className="mt-3 text-muted-foreground">{t.weightsLead}</p>
      <div className="mt-6 space-y-3">
        {themes.map((item) => {
          const copy = themeText(locale, item.id)
          return (
          <div key={item.id} className="rounded-xl border bg-card p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-medium">{copy.name}</h2>
                <p className="text-sm text-muted-foreground">{copy.hint}</p>
              </div>
              <div className="seg sm:min-w-[280px]" role="radiogroup" aria-label={copy.name}>
                {weightLevels.map((level) => {
                  const on = weights[item.id] === level.id
                  return (
                    <button
                      key={level.id}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => onChange(item.id, level.id)}
                    >
                      {t.weights[level.id]}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
          )
        })}
      </div>
      <button type="button" className="cta mt-6" disabled={!canStart} onClick={onNext}>{t.toQuestions}</button>
    </div>
  )
}

function Results({
  result,
  answers,
  weights,
  answered,
  activeId,
  onActive,
  copied,
  onCopy,
  onEdit,
  onReset,
  onWeight,
}: {
  result: SeatResult
  answers: Answers
  weights: Weights
  answered: number
  activeId: string | null
  onActive: (id: string | null) => void
  copied: boolean
  onCopy: () => void
  onEdit: () => void
  onReset: () => void
  onWeight: (themeId: string, level: number) => void
}) {
  const { t, locale } = useI18n()
  const closestId = result.closestId
  const groups = groupsFrom(result.seats).map((group) => ({ ...group, name: partyName(locale, group.id) }))
  const below = parties.filter((party) => result.seats[party.id] === 0)
  return (
    <div>
      <p className="text-[11px] font-semibold tracking-[0.18em] text-primary uppercase">{t.yourKnesset}</p>
      <h1 className="font-heading mt-2 max-w-3xl text-4xl leading-tight font-semibold sm:text-5xl">{result.verdictTitle}</h1>
      <p className="mt-4 max-w-3xl leading-relaxed text-muted-foreground">{result.verdictText}</p>
      {answered < 4 && <p className="mt-2 text-sm text-muted-foreground">{t.fewAnswers}</p>}
      <p className="mt-4 max-w-3xl">
        {t.closestBefore} <strong>{partyName(locale, closestId)}</strong>
        {locale !== 'he' && <span className="font-he text-muted-foreground"> {parties.find((party) => party.id === closestId)?.he}</span>}
        {`, ${partyLeader(locale, closestId)}. ${t.matchWord} ${formatPct(result.closeness[closestId], locale)}%.`}
      </p>

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-2xl border bg-card p-3 sm:p-5">
          <Hemicycle
            groups={groups}
            activeId={activeId}
            onPick={(id) => onActive(activeId === id ? null : id)}
            label="120"
            sub={t.hemicycleSub}
          />
        </div>
        <div>
        {activeId && <p className="mb-3 rounded-xl border bg-card px-4 py-3 text-sm leading-relaxed">{partyAbout(locale, activeId)}</p>}
        <ul className="space-y-1.5">
          {parties
            .filter((party) => result.seats[party.id] > 0)
            .slice()
            .sort((a, b) => result.seats[b.id] - result.seats[a.id])
            .map((party) => (
              <li key={party.id}>
                <button
                  type="button"
                  onClick={() => onActive(activeId === party.id ? null : party.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-start ${activeId === party.id ? 'bg-muted' : ''}`}
                >
                  <i className="size-3 shrink-0 rounded-full" style={{ background: party.color }} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{partyName(locale, party.id)}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {locale === 'he' ? partyLeader(locale, party.id) : <><span className="font-he">{party.he}</span> · {partyLeader(locale, party.id)}</>}
                    </span>
                  </span>
                  <span className="font-heading text-xl">{result.seats[party.id]}</span>
                </button>
              </li>
            ))}
          {below.length > 0 && (
            <li className="px-2 pt-3 text-sm text-muted-foreground">
              {t.belowLine(below.map((party) => `${partyName(locale, party.id)} (${formatPct(result.raw[party.id], locale)}%)`).join(', '))}
            </li>
          )}
        </ul>
        </div>
      </div>

      <div className="mt-10"><WikiCard result={result} /></div>

      <section className="mt-10">
        <h2 className="font-heading text-2xl font-semibold">{t.whoBuilds}</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {result.scenarios.map((scenario) => {
            const enough = scenario.total >= MAJORITY
            const lead = scenario.id === result.primaryId
            return (
              <article key={scenario.id} className={`rounded-xl border bg-card p-4 ${lead ? 'ring-2 ring-primary' : ''}`}>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-medium">{scenario.name}</h3>
                  <p className={`font-heading text-3xl leading-none ${enough ? 'text-primary' : ''}`}>{scenario.total}</p>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{enough ? t.enough(scenario.outside.length > 0) : t.shortBy(MAJORITY - scenario.total)}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {scenario.ids.map((id) => (
                    <span key={id} className="rounded-full bg-muted px-2 py-0.5 text-xs">{partyName(locale, id)} {result.seats[id]}</span>
                  ))}
                  {scenario.outside.map((id) => (
                    <span key={id} className="rounded-full border border-dashed px-2 py-0.5 text-xs">{t.outsidePrefix}: {partyName(locale, id)} {result.seats[id]}</span>
                  ))}
                </div>
                <p className="mt-3 text-sm leading-relaxed">{scenario.note}</p>
                {scenario.pm && <p className="mt-2 text-sm">{t.pmCandidate(partyLeader(locale, scenario.pm))}</p>}
              </article>
            )
          })}
        </div>
      </section>

      <div className="mt-10"><OwnCoalition seats={result.seats} /></div>

      {result.coalitions.length > 0 && (
        <section className="mt-10">
          <h2 className="font-heading text-2xl font-semibold">{t.shortestTitle}</h2>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{t.shortestLead}</p>
          <ul className="mt-4 space-y-2">
            {result.coalitions.map((coalition) => (
              <li key={coalition.ids.join('-')} className="rounded-xl border bg-card px-4 py-3 text-sm">
                <span className="font-medium">{coalition.ids.map((id) => partyName(locale, id)).join(' + ')}</span>
                <span className="text-muted-foreground"> · {coalition.seats} · {t.primeWord} {partyLeader(locale, coalition.pm)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {result.cabinet && (
        <section className="mt-10">
          <h2 className="font-heading text-2xl font-semibold">{t.portfolios}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t.portfoliosLead}</p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {result.cabinet.map((seat) => {
              return (
                <li key={seat.post} className="flex items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3">
                  <span>{postName(locale, seat.post)}</span>
                  <span className="text-end">
                    <span className="block font-medium">{partyName(locale, seat.partyId)}</span>
                    <span className="block text-xs text-muted-foreground">{partyLeader(locale, seat.partyId)}</span>
                  </span>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <div className="mt-10"><BillList seats={result.seats} answers={answers} /></div>
      <div className="mt-10">
        <ThemeShareList
          answers={answers}
          weights={weights}
          onWeight={onWeight}
        />
      </div>

      <section className="mt-10 rounded-2xl border bg-card p-5">
        <h2 className="font-heading text-2xl font-semibold">{result.outlookTitle}</h2>
        <p className="mt-2 max-w-3xl leading-relaxed">{result.outlookText}</p>
        <p className="mt-2 text-sm text-muted-foreground">{t.outlookCaveat}</p>
      </section>

      <section className="mt-10">
        <h2 className="font-heading text-2xl font-semibold">{t.besidePolls}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t.besideLead}</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-start text-muted-foreground">
              <tr>
                <th className="py-2 pe-3 text-start font-medium">{t.colList}</th>
                <th className="py-2 ps-3 text-end font-medium">{t.colYou}</th>
                <th className="py-2 ps-3 text-end font-medium">{t.colPolls}</th>
              </tr>
            </thead>
            <tbody>
              {parties.map((party) => (
                <tr key={party.id} className="border-t">
                  <td className="py-2 pe-3">
                    <span className="me-2 inline-block size-2.5 rounded-full align-middle" style={{ background: party.color }} />
                    {partyName(locale, party.id)}
                  </td>
                  <td className="py-2 ps-3 text-end tabular-nums">{result.seats[party.id]}</td>
                  <td className="py-2 ps-3 text-end">{party.poll || t.belowWord}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-10"><ThemeStrips answers={answers} /></div>

      <section className="mt-10">
        <h2 className="font-heading text-2xl font-semibold">{t.whereTitle}</h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{t.whereLead}</p>
        <div className="mt-4 max-w-lg">
          <Compass user={result.compassUser} parties={result.compassParties} />
        </div>
      </section>

      <div className="mt-10 flex flex-wrap gap-3">
        <Button type="button" className="h-11 px-5" onClick={onCopy}>{copied ? t.copied : t.copy}</Button>
        <Button type="button" variant="outline" className="h-11" onClick={() => {
          const names = Object.fromEntries(parties.map((party) => [party.id, partyName(locale, party.id)]))
          void downloadResultCard({
            brand: `${t.brandKicker} · ${t.brand}`,
            title: result.verdictTitle,
            subtitle: t.yourKnesset,
            seats: result.seats,
            names,
            label: '120',
            sub: t.hemicycleSub,
            lines: [
              `${t.closestBefore} ${partyName(locale, closestId)}, ${formatPct(result.closeness[closestId], locale)}%`,
              t.majorityMark,
            ],
          })
        }}>{t.saveImage}</Button>
        <Button type="button" variant="outline" className="h-11" onClick={onEdit}>{t.editAnswers}</Button>
        <Button type="button" variant="ghost" className="h-11" onClick={onReset}>{t.restart}</Button>
      </div>
      <p className="mt-8 max-w-3xl text-xs leading-relaxed text-muted-foreground">{t.disclaimer}</p>
    </div>
  )
}
