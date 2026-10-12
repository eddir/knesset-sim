import { questions, themes } from './data'

export function themeOrder(weights: Record<string, number>): string[] {
  return themes
    .map((theme, index) => ({ id: theme.id, index, level: weights[theme.id] ?? 0 }))
    .filter((item) => item.level > 0)
    .sort((a, b) => a.level - b.level || a.index - b.index)
    .map((item) => item.id)
}

export function questionsInOrder(order: string[]) {
  const known = new Set(order)
  return order
    .filter((id, index) => known.has(id) && order.indexOf(id) === index)
    .flatMap((themeId) => questions.filter((question) => question.theme === themeId))
}

export function snapSlider(value: number) {
  const clamped = Math.max(-1, Math.min(1, value))
  if (Math.abs(clamped) < 0.04) return 0
  return Math.round(clamped * 100) / 100
}

export function sectionSpan(order: string[], themeId: string) {
  const list = questionsInOrder(order)
  const indexes = list.map((question, index) => (question.theme === themeId ? index : -1)).filter((index) => index >= 0)
  if (!indexes.length) return null
  return { start: indexes[0], end: indexes[indexes.length - 1], count: indexes.length }
}
