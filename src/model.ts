import {
  blocs,
  canBePm,
  MAJORITY,
  parties,
  partyById,
  posts,
  questions,
  SEAT_COUNT,
  themes,
  THRESHOLD,
  vetoPairs,
  weightLevels,
  type Question,
} from './data'

const SIGMA = 0.4

export type Answers = Record<string, number | null>
export type Weights = Record<string, number>

export type Scenario = {
  id: string
  name: string
  ids: string[]
  seats: number
  pm: string | null
  outside: string[]
  total: number
  note: string
}

export type Coalition = {
  ids: string[]
  seats: number
  pm: string
}

export type SeatResult = {
  seats: Record<string, number>
  raw: Record<string, number>
  closestId: string
  closeness: Record<string, number>
  scenarios: Scenario[]
  coalitions: Coalition[]
  primaryId: string | null
  verdictTitle: string
  verdictText: string
  outlookTitle: string
  outlookText: string
  compassUser: { x: number; y: number } | null
  compassParties: { id: string; x: number; y: number }[]
  cabinet: { post: string; partyId: string }[] | null
}

export function defaultWeights(): Weights {
  return Object.fromEntries(themes.map((theme) => [theme.id, 2]))
}

export function dhondt(weights: number[], total: number): number[] {
  const seats = weights.map(() => 0)
  if (weights.every((weight) => weight <= 0) || total <= 0) return seats
  for (let round = 0; round < total; round += 1) {
    let best = -1
    let bestQuota = -1
    for (let index = 0; index < weights.length; index += 1) {
      if (weights[index] <= 0) continue
      const quota = weights[index] / (seats[index] + 1)
      if (quota > bestQuota + 1e-12) {
        best = index
        bestQuota = quota
      }
    }
    if (best < 0) break
    seats[best] += 1
  }
  return seats
}

function themeWeight(weights: Weights, themeId: string) {
  const level = weights[themeId]
  const found = weightLevels.find((item) => item.id === level)
  return found ? found.w : weightLevels[2].w
}

function answered(questionsIn: Question[], answers: Answers, weights: Weights) {
  return questionsIn.filter((question) => {
    if (!(question.id in answers) || answers[question.id] == null) return false
    return themeWeight(weights, question.theme) > 0
  })
}

function shares(question: Question, value: number) {
  const distances = parties.map((party) => {
    const stance = question.stance[party.id] ?? 0
    return (value - stance) ** 2
  })
  const floor = Math.min(...distances)
  const raw = distances.map((distance) => Math.exp(-(distance - floor) / (2 * SIGMA * SIGMA)))
  const sum = raw.reduce((total, item) => total + item, 0)
  return raw.map((item) => (sum ? item / sum : 0))
}

export function vetoed(ids: string[]) {
  for (let i = 0; i < ids.length; i += 1) {
    for (let j = i + 1; j < ids.length; j += 1) {
      const pair = vetoPairs.some(
        ([a, b]) => (a === ids[i] && b === ids[j]) || (b === ids[i] && a === ids[j]),
      )
      if (pair) return true
    }
  }
  return false
}

export function primeMinister(ids: string[], seats: Record<string, number>) {
  const present = ids.filter((id) => (seats[id] ?? 0) > 0)
  if (!present.length) return null
  const satellites = new Set(['otzma', 'rz', 'shas', 'utj', 'amcha'])
  if (present.includes('likud') && present.every((id) => id === 'likud' || satellites.has(id))) {
    return 'likud'
  }
  const pool = present.filter((id) => canBePm(id))
  const source = pool.length ? pool : present
  return source.slice().sort((a, b) => (seats[b] ?? 0) - (seats[a] ?? 0) || a.localeCompare(b))[0]
}

function span(ids: string[]) {
  const ranks = ids.map((id) => partyById(id).lr)
  return Math.max(...ranks) - Math.min(...ranks)
}

export function minimalCoalitions(seats: Record<string, number>): Coalition[] {
  const ids = parties.filter((party) => party.cabinet && (seats[party.id] ?? 0) > 0).map((party) => party.id)
  const found: Coalition[] = []
  const limit = 1 << ids.length
  for (let mask = 1; mask < limit; mask += 1) {
    const member: string[] = []
    let total = 0
    for (let index = 0; index < ids.length; index += 1) {
      if ((mask & (1 << index)) === 0) continue
      member.push(ids[index])
      total += seats[ids[index]] ?? 0
    }
    if (total < MAJORITY || vetoed(member)) continue
    if (member.some((id) => total - (seats[id] ?? 0) >= MAJORITY)) continue
    const pm = primeMinister(member, seats)
    if (!pm) continue
    found.push({ ids: member, seats: total, pm })
  }
  found.sort(
    (a, b) => a.ids.length - b.ids.length || span(a.ids) - span(b.ids) || b.seats - a.seats,
  )
  const seen = new Set<string>()
  return found.filter((item) => {
    const key = item.ids.slice().sort().join('+')
    if (seen.has(key)) return false
    seen.add(key)
    return true
  }).slice(0, 4)
}

function sumIds(seats: Record<string, number>, ids: string[]) {
  return ids.reduce((total, id) => total + (seats[id] ?? 0), 0)
}

export function buildScenarios(seats: Record<string, number>): Scenario[] {
  const rightIds = blocs[0].ids.filter((id) => (seats[id] ?? 0) > 0)
  const changeIds = blocs[1].ids.filter((id) => (seats[id] ?? 0) > 0)
  const raam = seats.raam ?? 0
  const joint = seats.joint ?? 0
  const rightSeats = sumIds(seats, rightIds)
  const changeSeats = sumIds(seats, changeIds)
  const withRaamIds = raam > 0 ? [...changeIds, 'raam'] : changeIds
  const withRaam = changeSeats + raam

  const scenarios: Scenario[] = [
    {
      id: 'right',
      name: 'Блок Нетаньяху',
      ids: rightIds,
      seats: rightSeats,
      pm: primeMinister(rightIds, seats),
      outside: [],
      total: rightSeats,
      note: 'Ликуд, религиозная правая и харедимные списки, у которых есть мандаты.',
    },
    {
      id: 'change',
      name: 'Блок перемен',
      ids: changeIds,
      seats: changeSeats,
      pm: primeMinister(changeIds, seats),
      outside: [],
      total: changeSeats,
      note: 'Яшар, Бейахад, Демократы и Наш дом Израиль. Без арабских списков.',
    },
  ]

  if (raam > 0) {
    scenarios.push({
      id: 'raam',
      name: 'Блок перемен и РААМ',
      ids: withRaamIds,
      seats: withRaam,
      pm: primeMinister(changeIds, seats),
      outside: [],
      total: withRaam,
      note: 'Так уже собирали кабинет в 2021 году: сионистская оппозиция плюс РААМ Мансура Аббаса.',
    })
  }

  if (joint > 0) {
    scenarios.push({
      id: 'outside',
      name: 'Меньшинство с внешней поддержкой',
      ids: withRaamIds,
      seats: withRaam,
      pm: primeMinister(changeIds, seats),
      outside: ['joint'],
      total: withRaam + joint,
      note: 'Объединённый список не входит в кабинет. Голоса за инвеституру возможны только если на это пойдёт весь список, включая Балад. Это развилка, не договор.',
    })
  }

  return scenarios
}

function pickPrimary(scenarios: Scenario[], closestId: string): string | null {
  const cabinet = scenarios.filter((item) => item.outside.length === 0 && item.total >= MAJORITY)
  if (!cabinet.length) {
    const minority = scenarios.find((item) => item.id === 'outside' && item.total >= MAJORITY)
    return minority ? minority.id : null
  }
  if (cabinet.length === 1) return cabinet[0].id
  const closestBloc = partyById(closestId).bloc
  const preferred = closestBloc === 'netanyahu' ? 'right' : closestBloc === 'arab' ? 'raam' : 'change'
  return (cabinet.find((item) => item.id === preferred) ?? cabinet.slice().sort((a, b) => b.total - a.total)[0]).id
}

function leaderName(id: string | null) {
  if (!id) return 'некому'
  return partyById(id).leader
}

function narrate(scenarios: Scenario[], primaryId: string | null) {
  const byId = Object.fromEntries(scenarios.map((item) => [item.id, item]))
  const right = byId.right
  const change = byId.change
  const raam = byId.raam
  const outside = byId.outside
  const primary = primaryId ? byId[primaryId] : undefined

  if (!primary) {
    const best = scenarios.slice().sort((a, b) => b.total - a.total)[0]
    return {
      verdictTitle: '61 не собирается',
      verdictText: `Блок Нетаньяху получает ${right?.seats ?? 0}, блок перемен ${change?.seats ?? 0}${raam ? `, с РААМ ${raam.total}` : ''}${outside ? `, а с внешней поддержкой Объединённого списка ${outside.total}` : ''}. Ближайшая попытка всё равно короче большинства. Такой Кнессет обычно заканчивается торгом и разговором о повторных выборах.`,
      outlookTitle: 'Повторные выборы',
      outlookText: best
        ? `Дальше всех дотягивается «${best.name}»: ${best.total} из ${MAJORITY}. Президент может выдать первый мандат, но без 61 он сгорает.`
        : 'Мандатов не хватает ни одному лагерю.',
    }
  }

  if (primary.outside.length) {
    return {
      verdictTitle: `Извне набирается ${primary.total}`,
      verdictText: `Кабинет блока перемен${raam ? ' и РААМ' : ''} имеет только ${primary.seats}. Вместе с Объединённым списком, который остаётся вне правительства, выходит ${primary.total}. Это правительство меньшинства: бюджет жив, пока внешняя поддержка не отказала.`,
      outlookTitle: 'Хрупкий кабинет',
      outlookText: `Премьер в таком раскладе ${leaderName(primary.pm)}. Объединённый список портфелей не получает и может отозвать поддержку на первом же бюджете.`,
    }
  }

  const others = scenarios.filter((item) => item.id !== primary.id && item.outside.length === 0 && item.total >= MAJORITY)
  const rival = others.length ? ` Собрать большинство может и другой лагерь: ${others.map((item) => `${item.name} (${item.total})`).join(', ')}.` : ''
  return {
    verdictTitle: `${primary.name}: ${primary.total}`,
    verdictText: `${primary.note} Этого хватает на инвеституру.${rival} Мандат на формирование, по составу этого большинства, получает ${leaderName(primary.pm)}.`,
    outlookTitle: primary.id === 'right' ? 'Правый кабинет' : 'Кабинет без Нетаньяху',
    outlookText:
      primary.id === 'right'
        ? 'В повестке снова судебная реформа, спор о призыве харедим откладывают, а линия по Газе остаётся линией кабинета безопасности.'
        : 'В повестке комиссия по 7 октября и закон о призыве. РААМ, если он внутри, торгует бюджеты арабских городов, а не МИД и не армию.',
  }
}

function compassOf(weights: Weights, pick: (question: Question) => number | null) {
  let x = 0
  let y = 0
  let xw = 0
  let yw = 0
  for (const question of questions) {
    const value = pick(question)
    if (value == null) continue
    const weight = themeWeight(weights, question.theme)
    if (weight <= 0) continue
    const ax = Math.abs(question.x)
    const ay = Math.abs(question.y)
    x += value * question.x * weight
    y += value * question.y * weight
    xw += ax * weight
    yw += ay * weight
  }
  if (!xw && !yw) return null
  return {
    x: xw ? Math.max(-1, Math.min(1, x / xw)) : 0,
    y: yw ? Math.max(-1, Math.min(1, y / yw)) : 0,
  }
}

function buildCabinet(ids: string[], seats: Record<string, number>, pm: string | null) {
  if (!pm) return null
  const members = ids.filter((id) => partyById(id).cabinet && (seats[id] ?? 0) > 0)
  if (!members.length) return null
  const load = new Map<string, number>()
  const assigned: { post: string; partyId: string }[] = [{ post: 'pm', partyId: pm }]
  load.set(pm, 1)
  for (const post of posts) {
    if (post.id === 'pm') continue
    const fitted = members.filter((id) => partyById(id).fit.includes(post.id))
    const pool = fitted.length ? fitted : members
    pool.sort((a, b) => (load.get(a) ?? 0) - (load.get(b) ?? 0) || (seats[b] ?? 0) - (seats[a] ?? 0))
    const pick = pool[0]
    assigned.push({ post: post.id, partyId: pick })
    load.set(pick, (load.get(pick) ?? 0) + 1)
  }
  return assigned
}

export function simulate(answers: Answers, weights: Weights = defaultWeights()): SeatResult {
  const active = answered(questions, answers, weights)
  const score = Object.fromEntries(parties.map((party) => [party.id, 0]))
  for (const question of active) {
    const value = answers[question.id]
    if (value == null) continue
    const weight = themeWeight(weights, question.theme)
    shares(question, value).forEach((share, index) => {
      score[parties[index].id] += share * weight
    })
  }
  if (!active.length) {
    for (const party of parties) score[party.id] = 1
  }

  const totalScore = Object.values(score).reduce((sum, value) => sum + value, 0) || 1
  const raw = Object.fromEntries(parties.map((party) => [party.id, score[party.id] / totalScore]))
  let eligible = parties.map((party) => raw[party.id] + 1e-12 >= THRESHOLD)
  if (!eligible.some(Boolean)) {
    const leader = parties.slice().sort((a, b) => raw[b.id] - raw[a.id])[0]
    eligible = parties.map((party) => party.id === leader.id)
  }
  const voteWeights = parties.map((party, index) => (eligible[index] ? score[party.id] : 0))
  const allocated = dhondt(voteWeights, SEAT_COUNT)
  const seats = Object.fromEntries(parties.map((party, index) => [party.id, allocated[index]]))

  const closeness: Record<string, number> = {}
  for (const party of parties) {
    let sum = 0
    let weightSum = 0
    for (const question of active) {
      const value = answers[question.id]
      if (value == null) continue
      const weight = themeWeight(weights, question.theme)
      sum += weight * (1 - Math.abs(value - (question.stance[party.id] ?? 0)) / 2)
      weightSum += weight
    }
    closeness[party.id] = weightSum ? sum / weightSum : 0
  }
  const closestId = parties
    .slice()
    .sort((a, b) => closeness[b.id] - closeness[a.id] || b.poll - a.poll)[0].id

  const scenarios = buildScenarios(seats)
  const primaryId = pickPrimary(scenarios, closestId)
  const primary = scenarios.find((item) => item.id === primaryId) ?? null
  const text = narrate(scenarios, primaryId)
  const cabinet = primary && primary.total >= MAJORITY && primary.outside.length === 0
    ? buildCabinet(primary.ids, seats, primary.pm)
    : null

  return {
    seats,
    raw,
    closestId,
    closeness,
    scenarios,
    coalitions: minimalCoalitions(seats),
    primaryId,
    verdictTitle: text.verdictTitle,
    verdictText: text.verdictText,
    outlookTitle: text.outlookTitle,
    outlookText: text.outlookText,
    compassUser: compassOf(weights, (question) => (question.id in answers ? answers[question.id] : null)),
    compassParties: parties.map((party) => {
      const point = compassOf(defaultWeights(), (question) => question.stance[party.id] ?? 0)
      return { id: party.id, x: point?.x ?? 0, y: point?.y ?? 0 }
    }),
    cabinet,
  }
}

export function pollSeats() {
  return Object.fromEntries(parties.map((party) => [party.id, party.poll]))
}

export function formatPct(value: number) {
  return new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value * 100)
}
