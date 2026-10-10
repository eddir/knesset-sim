import { describe, expect, it } from 'vitest'
import { parties, questions, SEAT_COUNT, THRESHOLD } from './data'
import { questionText, themeText } from './i18n'
import { buildScenarios, defaultWeights, dhondt, minimalCoalitions, simulate, vetoed } from './model'

function fill(value: number) {
  return Object.fromEntries(questions.map((question) => [question.id, value]))
}

function seatsOf(value: number) {
  return simulate(fill(value)).seats
}

function bloc(seats: Record<string, number>, ids: string[]) {
  return ids.reduce((sum, id) => sum + (seats[id] ?? 0), 0)
}

describe('языки', () => {
  it('переводит вердикт и не меняет мандаты', () => {
    const ru = simulate(fill(0))
    const en = simulate(fill(0), defaultWeights(), 'en')
    const he = simulate(fill(0), defaultWeights(), 'he')
    expect(en.seats).toEqual(ru.seats)
    expect(he.seats).toEqual(ru.seats)
    expect(ru.verdictTitle).toMatch(/[А-Яа-я]/)
    expect(en.verdictTitle).not.toMatch(/[А-Яа-яЁё]/)
    expect(he.verdictTitle).toMatch(/[\u0590-\u05FF]/)
    expect(en.scenarios.map((item) => item.name).join(' ')).not.toMatch(/[А-Яа-яЁё]/)
  })

  it('даёт английский и иврит каждому вопросу и теме', () => {
    for (const question of questions) {
      for (const locale of ['en', 'he'] as const) {
        const copy = questionText(locale, question.id)
        expect(copy.title.length).toBeGreaterThan(1)
        expect(copy.a.length).toBeGreaterThan(1)
        expect(copy.b.length).toBeGreaterThan(1)
        expect(`${copy.title} ${copy.a} ${copy.b}`).not.toMatch(/[А-Яа-яЁё]/)
      }
    }
    for (const theme of ['security', 'land', 'power', 'faith', 'money', 'citizens']) {
      expect(themeText('en', theme).name).not.toMatch(/[А-Яа-яЁё]/)
      expect(themeText('he', theme).name).toMatch(/[\u0590-\u05FF]/)
    }
  })
})

describe('dhondt', () => {
  it('делит классический пример 8 мандатов', () => {
    expect(dhondt([100, 80, 30, 20], 8)).toEqual([4, 3, 1, 0])
  })

  it('отдаёт все мандаты единственному списку', () => {
    expect(dhondt([1, 0, 0], 120).reduce((sum, n) => sum + n, 0)).toBe(120)
    expect(dhondt([1, 0, 0], 120)[0]).toBe(120)
  })
})

describe('knesset 2026', () => {
  it('у каждого вопроса есть позиция каждого списка', () => {
    for (const question of questions) {
      for (const party of parties) {
        const stance = question.stance[party.id]
        expect(stance).toBeGreaterThanOrEqual(-1)
        expect(stance).toBeLessThanOrEqual(1)
      }
    }
  })

  it('опросные мандаты складываются в 120', () => {
    expect(parties.reduce((sum, party) => sum + party.poll, 0)).toBe(SEAT_COUNT)
  })

  it('всегда раздаёт 120 мандатов', () => {
    for (const value of [-1, -0.5, 0, 0.5, 1]) {
      const seats = seatsOf(value)
      expect(Object.values(seats).reduce((sum, n) => sum + n, 0)).toBe(SEAT_COUNT)
    }
  })

  it('жёсткий правый ответ собирает блок Нетаньяху', () => {
    const seats = seatsOf(-1)
    const right = bloc(seats, ['likud', 'otzma', 'rz', 'shas', 'utj', 'amcha'])
    const change = bloc(seats, ['yashar', 'byachad', 'democrats', 'yb'])
    expect(right).toBeGreaterThan(70)
    expect(change).toBeLessThan(25)
    expect(seats.democrats).toBe(0)
    expect(seats.joint).toBe(0)
  })

  it('жёсткий левый ответ оставляет правый блок без большинства', () => {
    const seats = seatsOf(1)
    const right = bloc(seats, ['likud', 'otzma', 'rz', 'shas', 'utj', 'amcha'])
    expect(right).toBeLessThan(40)
    expect(seats.democrats + seats.joint + seats.yashar).toBeGreaterThan(seats.likud + seats.otzma)
  })

  it('середина не даёт ни одному лагерю 61', () => {
    const result = simulate(fill(0))
    const right = bloc(result.seats, ['likud', 'otzma', 'rz', 'shas', 'utj', 'amcha'])
    const change = bloc(result.seats, ['yashar', 'byachad', 'democrats', 'yb'])
    expect(right).toBeLessThan(61)
    expect(change).toBeLessThan(61)
    expect(result.primaryId === null || result.primaryId === 'outside' || result.primaryId === 'raam').toBe(true)
    expect(['yashar', 'byachad', 'yb']).toContain(result.closestId)
  })

  it('список ниже барьера не получает мандатов', () => {
    const result = simulate(fill(0))
    for (const party of parties) {
      if (result.raw[party.id] + 1e-9 < THRESHOLD) expect(result.seats[party.id]).toBe(0)
    }
  })
})

describe('coalitions', () => {
  it('не сажает Ликуд с Яшаром', () => {
    expect(vetoed(['likud', 'yashar'])).toBe(true)
  })

  it('по опросному раскладу кабинетного большинства нет, извне 61 есть', () => {
    const seats = Object.fromEntries(parties.map((party) => [party.id, party.poll]))
    const scenarios = buildScenarios(seats)
    expect(scenarios.find((item) => item.id === 'right')?.seats).toBe(52)
    expect(scenarios.find((item) => item.id === 'change')?.seats).toBe(54)
    expect(scenarios.find((item) => item.id === 'raam')?.total).toBe(60)
    expect(scenarios.find((item) => item.id === 'outside')?.total).toBe(68)
    const coalitions = minimalCoalitions(seats)
    expect(coalitions.every((item) => item.seats >= 61)).toBe(true)
    expect(coalitions.some((item) => item.ids.includes('likud') && item.ids.includes('yashar'))).toBe(false)
  })
})
