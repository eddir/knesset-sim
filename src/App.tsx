import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react'
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
import { Hemicycle, StackedBar } from '@/components/Hemicycle'
import { groupsFrom } from '@/hemicycle'
import {
  blocs,
  MAJORITY,
  parties,
  partyById,
  posts,
  questions,
  themes,
  weightLevels,
} from '@/data'
import { defaultWeights, formatPct, simulate, type Answers, type SeatResult, type Weights } from '@/model'

type Phase = 'intro' | 'weights' | 'questions' | 'results'

type Save = {
  phase: Phase
  weights: Weights
  answers: Answers
  index: number
}

const STORAGE = 'knesset-2026-v1'
const choices = [
  { value: -1, key: '1', name: 'Первый' },
  { value: -0.5, key: '2', name: 'Скорее первый' },
  { value: 0, key: '3', name: 'Середина' },
  { value: 0.5, key: '4', name: 'Скорее второй' },
  { value: 1, key: '5', name: 'Второй' },
]
const choiceValues = new Set(choices.map((choice) => choice.value))
const weightValues = new Set<number>(weightLevels.map((level) => level.id))

function loadSave(): Save {
  const empty: Save = { phase: 'intro', weights: defaultWeights(), answers: {}, index: 0 }
  try {
    const raw = localStorage.getItem(STORAGE)
    if (!raw) return empty
    const data = JSON.parse(raw) as Partial<Save>
    const phase: Phase = data.phase === 'weights' || data.phase === 'questions' || data.phase === 'results' ? data.phase : 'intro'
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
        else if (typeof value === 'number' && choiceValues.has(value)) answers[question.id] = value
      }
    }
    const index = Number.isFinite(data.index) ? Math.round(data.index ?? 0) : 0
    return {
      phase,
      weights,
      answers,
      index: Math.max(0, Math.min(questions.length - 1, index)),
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
  const [activeId, setActiveId] = useState<string | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const theme = useTheme()
  const headingRef = useRef<HTMLHeadingElement>(null)
  const timer = useRef<number>(0)
  const result = useMemo(() => simulate(answers, weights), [answers, weights])
  const shareKey = parties.map((party) => result.seats[party.id]).join('.')
  const copied = copiedKey === shareKey

  useEffect(() => {
    const save: Save = { phase, weights, answers, index }
    localStorage.setItem(STORAGE, JSON.stringify(save))
  }, [phase, weights, answers, index])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  useEffect(() => {
    if (!copied) return
    const id = window.setTimeout(() => setCopiedKey(null), 2200)
    return () => window.clearTimeout(id)
  }, [copied])

  useEffect(() => {
    if (phase === 'questions') headingRef.current?.focus()
    window.scrollTo(0, 0)
  }, [phase, index])

  const answered = questions.filter((question) => question.id in answers).length

  function go(next: Phase) {
    window.clearTimeout(timer.current)
    if (next !== 'results') setActiveId(null)
    setPhase(next)
  }

  function reset() {
    setAnswers({})
    setWeights(defaultWeights())
    setIndex(0)
    setActiveId(null)
    go('intro')
  }

  const backQuestion = useCallback(() => {
    window.clearTimeout(timer.current)
    if (index === 0) setPhase('weights')
    else setIndex((current) => current - 1)
  }, [index])

  const pick = useCallback((value: number | null) => {
    const question = questions[index]
    setAnswers((current) => ({ ...current, [question.id]: value }))
    window.clearTimeout(timer.current)
    const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 180
    timer.current = window.setTimeout(() => {
      if (index >= questions.length - 1) {
        setActiveId(null)
        setPhase('results')
      } else setIndex((current) => current + 1)
    }, delay)
  }, [index])

  useEffect(() => {
    if (phase !== 'questions') return
    function onKey(event: KeyboardEvent) {
      if (event.repeat || event.defaultPrevented) return
      if (document.querySelector('[role="dialog"]')) return
      const target = event.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return
      const choice = choices.find((item) => item.key === event.key)
      if (choice) {
        event.preventDefault()
        pick(choice.value)
      } else if (event.key === '0' || event.key === 'Escape') {
        event.preventDefault()
        pick(null)
      } else if (event.key === 'Backspace') {
        event.preventDefault()
        backQuestion()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [phase, pick, backQuestion])

  return (
    <div className="min-h-svh">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <button type="button" className="text-left" onClick={() => go('intro')}>
          <span className="block text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">26-й Кнессет</span>
          <span className="font-heading text-lg leading-none">Симулятор</span>
        </button>
        <div className="flex items-center gap-2">
          <MethodDialog />
          <Button type="button" variant="outline" size="icon" aria-label={theme.dark ? 'Светлая тема' : 'Тёмная тема'} onClick={theme.toggle}>
            {theme.dark ? <Sun /> : <Moon />}
          </Button>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl px-4 pb-20 sm:px-6">
        {phase === 'intro' && <Intro onStart={() => go('weights')} onSkip={() => { setIndex(0); go('questions') }} />}
        {phase === 'weights' && (
          <Weights
            weights={weights}
            onChange={(themeId, level) => setWeights((current) => ({ ...current, [themeId]: level }))}
            onNext={() => { setIndex(0); go('questions') }}
          />
        )}
        {phase === 'questions' && (
          <Question
            index={index}
            answers={answers}
            result={result}
            headingRef={headingRef}
            onPick={pick}
            onBack={backQuestion}
          />
        )}
        {phase === 'results' && (
          <Results
            result={result}
            answered={answered}
            activeId={activeId}
            onActive={setActiveId}
            copied={copied}
            onCopy={async () => {
              const lines = parties.filter((party) => result.seats[party.id]).map((party) => `${party.name} ${result.seats[party.id]}`)
              const text = `Мой Кнессет-2026: ${lines.join(', ')}. ${result.verdictTitle}`
              try {
                await navigator.clipboard.writeText(text)
                setCopiedKey(shareKey)
              } catch {
                setCopiedKey(null)
              }
            }}
            onEdit={() => { setIndex(questions.length - 1); go('questions') }}
            onReset={reset}
          />
        )}
      </main>
    </div>
  )
}

function MethodDialog() {
  return (
    <Dialog>
      <DialogTrigger render={<Button type="button" variant="outline" className="h-8" />}>Как считается</DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">Как собирается Кнессет</DialogTitle>
          <DialogDescription>
            Выборы 27 октября 2026 года, 26-й Кнессет. Модель повторяет правила, а не прогноз ЦИК.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm leading-relaxed text-foreground">
          <p>Один общенациональный округ, закрытые списки, 120 мандатов. Список ниже 3,25% действительных голосов не получает ничего, его голоса уходят остальным.</p>
          <p>Мандаты делятся методом Бадера-Офера: это метод д’Ондта. Каждый следующий мандат забирает список с наибольшим частным «голоса / (уже полученные места + 1)».</p>
          <p>Правительству нужны 61 голос. Соглашения об излишках между списками здесь не включены. Отказы сидеть в одном кабинете заданы по линиям кампании 2026 года: это редакционная оценка, не юридический запрет.</p>
          <p>Ваши ответы не выбирают одну партию. Они собирают Кнессет так, как если бы страна ответила так же. Близкие списки делят голоса, далёкие проваливаются под барьер.</p>
          <p>Цифры опросов на первом экране - округлённое среднее опубликованных мандатных прогнозов начала октября 2026 года. «Народ Израиля» Офера Винтера в этом среднем ниже барьера.</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Intro({ onStart, onSkip }: { onStart: () => void; onSkip: () => void }) {
  const poll = Object.fromEntries(parties.map((party) => [party.id, party.poll]))
  const right = blocs[0].ids.reduce((sum, id) => sum + (poll[id] ?? 0), 0)
  const change = blocs[1].ids.reduce((sum, id) => sum + (poll[id] ?? 0), 0)
  return (
    <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_0.95fr]">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.18em] text-primary uppercase">27 октября 2026</p>
        <h1 className="font-heading mt-3 text-4xl leading-[1.05] font-semibold sm:text-5xl">Соберите Кнессет своими ответами</h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
          Восемнадцать вопросов про Газу, суд, призыв харедим и то, кто должен быть премьером. На выходе 120 мандатов, барьер 3,25% и проверка, собирается ли кабинет на 61 место.
        </p>
        <dl className="mt-6 grid grid-cols-3 gap-2">
          {[
            ['120', 'мест'],
            ['3,25%', 'барьер'],
            ['61', 'для кабинета'],
          ].map(([value, name]) => (
            <div key={name} className="rounded-xl border bg-card px-3 py-3">
              <dt className="font-heading text-2xl leading-none">{value}</dt>
              <dd className="mt-1 text-xs text-muted-foreground">{name}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button type="button" className="h-11 px-5" onClick={onStart}>Начать</Button>
          <Button type="button" variant="ghost" className="h-11" onClick={onSkip}>Сразу к вопросам</Button>
        </div>
        <p className="mt-4 max-w-xl text-sm text-muted-foreground">
          Сейчас ни блок Нетаньяху ({right}), ни блок перемен ({change}) не дотягивают до 61. Так выглядит среднее опросов начала октября, не ваш результат.
        </p>
      </div>
      <figure className="rounded-2xl border bg-card p-3 sm:p-5">
        <Hemicycle groups={groupsFrom(poll)} label="120" sub="мандатов" />
        <figcaption className="px-2 pb-1 text-sm text-muted-foreground">
          Ликуд и Яшар по 23. РААМ и Объединённый список держат отдельный карман мандатов.
        </figcaption>
      </figure>
    </div>
  )
}

function Weights({
  weights,
  onChange,
  onNext,
}: {
  weights: Weights
  onChange: (themeId: string, level: number) => void
  onNext: () => void
}) {
  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-[11px] font-semibold tracking-[0.18em] text-primary uppercase">Шаг 1</p>
      <h1 className="font-heading mt-2 text-3xl font-semibold sm:text-4xl">Что для вас решает выборы</h1>
      <p className="mt-3 text-muted-foreground">Тема с весом «не важно» не влияет на мандаты. По умолчанию все шесть одинаково важны.</p>
      <div className="mt-6 space-y-3">
        {themes.map((theme) => (
          <div key={theme.id} className="rounded-xl border bg-card p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-medium">{theme.name}</h2>
                <p className="text-sm text-muted-foreground">{theme.hint}</p>
              </div>
              <div className="grid grid-cols-2 gap-1 sm:grid-cols-4" role="radiogroup" aria-label={theme.name}>
                {weightLevels.map((level) => {
                  const on = weights[theme.id] === level.id
                  return (
                    <button
                      key={level.id}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => onChange(theme.id, level.id)}
                      className={`h-9 rounded-lg px-2 text-xs font-medium ${on ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}
                    >
                      {level.name}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
      <Button type="button" className="mt-6 h-11 px-5" onClick={onNext}>К вопросам</Button>
    </div>
  )
}

function Question({
  index,
  answers,
  result,
  headingRef,
  onPick,
  onBack,
}: {
  index: number
  answers: Answers
  result: SeatResult
  headingRef: RefObject<HTMLHeadingElement | null>
  onPick: (value: number | null) => void
  onBack: () => void
}) {
  const question = questions[index]
  const theme = themes.find((item) => item.id === question.theme)
  const current = question.id in answers ? answers[question.id] : undefined
  const started = Object.keys(answers).length > 0
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center justify-between gap-3 text-sm text-muted-foreground">
        <span>{theme?.name}</span>
        <span>Вопрос {index + 1} из {questions.length}</span>
      </div>
      <div className="mb-5 h-1 overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-primary" style={{ width: `${(index / questions.length) * 100}%` }} />
      </div>
      <h1 ref={headingRef} tabIndex={-1} className="font-heading text-3xl font-semibold outline-none sm:text-4xl">{question.title}</h1>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Pole mark="А" text={question.a} hot={typeof current === 'number' && current < 0} />
        <Pole mark="Б" text={question.b} hot={typeof current === 'number' && current > 0} />
      </div>
      <div className="mt-4 grid grid-cols-5 gap-1.5" role="radiogroup" aria-label="Ответ">
        {choices.map((choice) => {
          const on = current === choice.value
          return (
            <button
              key={choice.key}
              type="button"
              role="radio"
              aria-checked={on}
              aria-label={`${choice.key} ${choice.name}`}
              onClick={() => onPick(choice.value)}
              className={`min-h-16 rounded-xl border px-1 text-center text-xs leading-tight font-medium sm:text-sm ${on ? 'border-primary bg-primary text-primary-foreground' : 'bg-card'}`}
            >
              <span className="block text-[10px] opacity-70">{choice.key}</span>
              {choice.name}
            </button>
          )
        })}
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <Button type="button" variant="ghost" onClick={onBack}>Назад</Button>
        <Button type="button" variant="outline" onClick={() => onPick(null)}>Пропустить</Button>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Клавиши 1–5, 0 пропуск, Backspace назад.</p>
      {started && (
        <div className="mt-8">
          <p className="mb-2 text-sm text-muted-foreground">Черновик Кнессета по уже данным ответам</p>
          <StackedBar seats={result.seats} />
        </div>
      )}
    </div>
  )
}

function Pole({ mark, text, hot }: { mark: string; text: string; hot: boolean }) {
  return (
    <div className={`rounded-xl border bg-card p-4 ${hot ? 'ring-2 ring-primary' : ''}`}>
      <span className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">Вариант {mark}</span>
      <p className="mt-1 leading-snug">{text}</p>
    </div>
  )
}

function Results({
  result,
  answered,
  activeId,
  onActive,
  copied,
  onCopy,
  onEdit,
  onReset,
}: {
  result: SeatResult
  answered: number
  activeId: string | null
  onActive: (id: string | null) => void
  copied: boolean
  onCopy: () => void
  onEdit: () => void
  onReset: () => void
}) {
  const closest = partyById(result.closestId)
  const groups = groupsFrom(result.seats)
  const below = parties.filter((party) => result.seats[party.id] === 0)
  return (
    <div>
      <p className="text-[11px] font-semibold tracking-[0.18em] text-primary uppercase">Ваш 26-й Кнессет</p>
      <h1 className="font-heading mt-2 max-w-3xl text-4xl leading-tight font-semibold sm:text-5xl">{result.verdictTitle}</h1>
      <p className="mt-4 max-w-3xl leading-relaxed text-muted-foreground">{result.verdictText}</p>
      {answered < 4 && <p className="mt-2 text-sm text-muted-foreground">Ответов мало, поэтому расклад ближе к ровному дележу, чем к настоящей кампании.</p>}
      <p className="mt-4 max-w-3xl">
        Ближе всего к ответам <strong>{closest.name}</strong>
        <span className="font-he text-muted-foreground"> {closest.he}</span>, {closest.leader}. Совпадение {formatPct(result.closeness[closest.id])}%.
      </p>

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-2xl border bg-card p-3 sm:p-5">
          <Hemicycle
            groups={groups}
            activeId={activeId}
            onPick={(id) => onActive(activeId === id ? null : id)}
            label="120"
            sub="мандатов"
          />
        </div>
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
                  className={`flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left ${activeId === party.id ? 'bg-muted' : ''}`}
                >
                  <i className="size-3 shrink-0 rounded-full" style={{ background: party.color }} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{party.name}</span>
                    <span className="font-he block truncate text-xs text-muted-foreground">{party.he} · {party.leader}</span>
                  </span>
                  <span className="font-heading text-xl">{result.seats[party.id]}</span>
                </button>
              </li>
            ))}
          {below.length > 0 && (
            <li className="px-2 pt-3 text-sm text-muted-foreground">
              Ниже барьера 3,25%: {below.map((party) => `${party.name} (${formatPct(result.raw[party.id])}%)`).join(', ')}.
            </li>
          )}
        </ul>
      </div>

      <section className="mt-10">
        <h2 className="font-heading text-2xl font-semibold">Кто собирает 61</h2>
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
                <p className="mt-1 text-sm text-muted-foreground">{enough ? `Хватает на большинство${scenario.outside.length ? ' только с внешней поддержкой' : ''}` : `Не хватает ${MAJORITY - scenario.total}`}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {scenario.ids.map((id) => {
                    const party = partyById(id)
                    return <span key={id} className="rounded-full bg-muted px-2 py-0.5 text-xs">{party.name} {result.seats[id]}</span>
                  })}
                  {scenario.outside.map((id) => (
                    <span key={id} className="rounded-full border border-dashed px-2 py-0.5 text-xs">извне: {partyById(id).name} {result.seats[id]}</span>
                  ))}
                </div>
                <p className="mt-3 text-sm leading-relaxed">{scenario.note}</p>
                {scenario.pm && <p className="mt-2 text-sm">Кандидат в премьеры: {partyById(scenario.pm).leader}</p>}
              </article>
            )
          })}
        </div>
      </section>

      {result.coalitions.length > 0 && (
        <section className="mt-10">
          <h2 className="font-heading text-2xl font-semibold">Самые короткие кабинеты</h2>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">Составы без лишней партии: если убрать кого-то одного, 61 уже нет. Пары, которые отказались сидеть вместе, сюда не попадают.</p>
          <ul className="mt-4 space-y-2">
            {result.coalitions.map((coalition) => (
              <li key={coalition.ids.join('-')} className="rounded-xl border bg-card px-4 py-3 text-sm">
                <span className="font-medium">{coalition.ids.map((id) => partyById(id).name).join(' + ')}</span>
                <span className="text-muted-foreground"> · {coalition.seats} · премьер {partyById(coalition.pm).leader}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {result.cabinet && (
        <section className="mt-10">
          <h2 className="font-heading text-2xl font-semibold">Портфели</h2>
          <p className="mt-2 text-sm text-muted-foreground">Черновая раскладка по тому, какой список в этом большинстве ближе к теме портфеля. Это не коалиционное соглашение.</p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {result.cabinet.map((seat) => {
              const post = posts.find((item) => item.id === seat.post)
              const party = partyById(seat.partyId)
              return (
                <li key={seat.post} className="flex items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3">
                  <span>{post?.name}</span>
                  <span className="text-right">
                    <span className="block font-medium">{party.name}</span>
                    <span className="block text-xs text-muted-foreground">{party.leader}</span>
                  </span>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <section className="mt-10 rounded-2xl border bg-card p-5">
        <h2 className="font-heading text-2xl font-semibold">{result.outlookTitle}</h2>
        <p className="mt-2 max-w-3xl leading-relaxed">{result.outlookText}</p>
        <p className="mt-2 text-sm text-muted-foreground">Сценарий по вашим ответам, не прогноз на 2030 год.</p>
      </section>

      <section className="mt-10">
        <h2 className="font-heading text-2xl font-semibold">Рядом с опросами</h2>
        <p className="mt-2 text-sm text-muted-foreground">Слева ваш Кнессет, справа среднее мандатных прогнозов начала октября 2026 года.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[32rem] text-sm">
            <thead className="text-left text-muted-foreground">
              <tr>
                <th className="py-2 font-medium">Список</th>
                <th className="py-2 font-medium">Вы</th>
                <th className="py-2 font-medium">Опросы</th>
              </tr>
            </thead>
            <tbody>
              {parties.map((party) => (
                <tr key={party.id} className="border-t">
                  <td className="py-2 pr-3">
                    <span className="mr-2 inline-block size-2.5 rounded-full align-middle" style={{ background: party.color }} />
                    {party.name}
                  </td>
                  <td className="py-2">{result.seats[party.id]}</td>
                  <td className="py-2">{party.poll || 'барьер'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-heading text-2xl font-semibold">Где вы стоите</h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">Горизонталь: от силы и территории к сделке. Вертикаль: от раввината и власти большинства к суду и светским правилам. Точка «вы» считается по тем же вопросам.</p>
        <div className="mt-4 max-w-lg">
          <Compass user={result.compassUser} parties={result.compassParties} />
        </div>
      </section>

      <div className="mt-10 flex flex-wrap gap-3">
        <Button type="button" className="h-11 px-5" onClick={onCopy}>{copied ? 'Скопировано' : 'Скопировать расклад'}</Button>
        <Button type="button" variant="outline" className="h-11" onClick={onEdit}>Изменить ответы</Button>
        <Button type="button" variant="ghost" className="h-11" onClick={onReset}>Сначала</Button>
      </div>
      <p className="mt-8 max-w-3xl text-xs leading-relaxed text-muted-foreground">
        Позиции списков - редакционная оценка по публичным заявлениям на осень 2026 года. Кнессет распущен 17 июля 2026 года, голосование назначено на 27 октября. Проект не связан с Центральной избирательной комиссией и не является избирательной агитацией.
      </p>
    </div>
  )
}
