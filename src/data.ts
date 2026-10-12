// Редакционные позиции списков на выборах в 26-й Кнессет 27 октября 2026.
// Это не официальный калькулятор и не программа партии: оценка по публичным
// заявлениям и по тому, с кем список готов сидеть в одном кабинете.

export type BlocId = 'netanyahu' | 'change' | 'arab'

export type Party = {
  id: string
  name: string
  he: string
  leader: string
  color: string
  bloc: BlocId
  poll: number
  lr: number
  about: string
  fit: string[]
  cabinet: boolean
}

export type Theme = {
  id: string
  name: string
  hint: string
  color: string
  lo: string
  hi: string
}

export type { Question } from './questions'

export const SEAT_COUNT = 120
export const MAJORITY = 61
export const THRESHOLD = 0.0325

export const themes: Theme[] = [
  { id: 'security', name: 'Война и сдерживание', hint: 'Газа, север, заложники, Иран', color: '#b42318', lo: 'Жёсткая сила', hi: 'Сделка и пауза' },
  { id: 'land', name: 'Территория', hint: 'Поселения, Иерусалим, Газа после войны', color: '#b45309', lo: 'Контроль и суверенитет', hi: 'Размежевание' },
  { id: 'power', name: 'Власть и суд', hint: 'Нетаньяху, Верховный суд, полиция', color: '#2a3fd0', lo: 'Власть большинства', hi: 'Сдержки и суд' },
  { id: 'faith', name: 'Религия и призыв', hint: 'Харедим, шаббат, раввинат', color: '#6d28d9', lo: 'Статус-кво раввината', hi: 'Светские правила' },
  { id: 'money', name: 'Кошелёк', hint: 'Цены, жильё, налоги', color: '#047857', lo: 'Рынок и низкие налоги', hi: 'Социальный бюджет' },
  { id: 'citizens', name: 'Граждане', hint: 'Арабские граждане, равенство, закон о нации', color: '#0f766e', lo: 'Еврейское государство', hi: 'Равный статус' },
  { id: 'world', name: 'Внешняя политика', hint: 'США, соглашения, правила после выборов', color: '#9f1239', lo: 'Опора на себя', hi: 'Союзы и нормы' },
]

export const weightLevels = [
  { id: 0, name: 'Не важно', w: 0 },
  { id: 1, name: 'Слабо', w: 1 },
  { id: 2, name: 'Важно', w: 2.2 },
  { id: 3, name: 'Решающе', w: 4 },
] as const

export const parties: Party[] = [
  {
    id: 'joint',
    name: 'Объединённый список',
    he: 'הרשימה המשותפת',
    leader: 'Юсеф Джабарин',
    color: '#BE185D',
    bloc: 'arab',
    poll: 8,
    lr: 0.4,
    about: 'Хадаш, Тааль и Балад. В опросах осени 2026 года список ведёт Юсеф Джабарин. В кабинет обычно не входит.',
    fit: [],
    cabinet: false,
  },
  {
    id: 'democrats',
    name: 'Демократы',
    he: 'הדמוקרטים',
    leader: 'Яир Голан',
    color: '#DC2626',
    bloc: 'change',
    poll: 10,
    lr: 2.1,
    about: 'Наследники Аводы и Мерец. Левый фланг сионистской оппозиции, лидер Яир Голан.',
    fit: ['jus', 'welfare', 'for'],
    cabinet: true,
  },
  {
    id: 'raam',
    name: 'РААМ',
    he: 'רע״מ',
    leader: 'Мансур Аббас',
    color: '#15803D',
    bloc: 'arab',
    poll: 6,
    lr: 3.2,
    about: 'Исламистский список Мансура Аббаса. В 2021 году уже входил в коалицию Беннета и Лапида.',
    fit: ['welfare'],
    cabinet: true,
  },
  {
    id: 'yashar',
    name: 'Яшар',
    he: 'ישר',
    leader: 'Гади Айзенкот',
    color: '#0F766E',
    bloc: 'change',
    poll: 23,
    lr: 4.3,
    about: 'Центристский список бывшего начальника Генштаба Гади Айзенкота. В опросах осени 2026 года идёт вровень с Ликудом.',
    fit: ['def', 'for', 'jus'],
    cabinet: true,
  },
  {
    id: 'byachad',
    name: 'Бейахад',
    he: 'ביחד',
    leader: 'Нафтали Беннет',
    color: '#0284C7',
    bloc: 'change',
    poll: 12,
    lr: 5.5,
    about: '«Вместе», партия Нафтали Беннета. Правее Яшара, но в этом цикле против возвращения Нетаньяху.',
    fit: ['def', 'fin', 'for'],
    cabinet: true,
  },
  {
    id: 'yb',
    name: 'Наш дом Израиль',
    he: 'ישראל ביתנו',
    leader: 'Авигдор Либерман',
    color: '#CA8A04',
    bloc: 'change',
    poll: 9,
    lr: 6.3,
    about: 'Партия Авигдора Либермана: жёсткая безопасность и такой же жёсткий отказ беречь освобождение харедим от армии.',
    fit: ['fin', 'sec'],
    cabinet: true,
  },
  {
    id: 'likud',
    name: 'Ликуд',
    he: 'הליכוד',
    leader: 'Биньямин Нетаньяху',
    color: '#1D4E89',
    bloc: 'netanyahu',
    poll: 23,
    lr: 7.3,
    about: 'Правящая партия. Список ведёт Биньямин Нетаньяху, премьер распущенного 25-го Кнессета.',
    fit: ['def', 'fin', 'for', 'jus', 'sec'],
    cabinet: true,
  },
  {
    id: 'amcha',
    name: 'Народ Израиля',
    he: 'עם ישראל',
    leader: 'Офер Винтер',
    color: '#3F6212',
    bloc: 'netanyahu',
    poll: 0,
    lr: 7.8,
    about: 'Правый список генерала запаса Офера Винтера. В части сводок его называют «Амха Исраэль». В среднем опросов начала октября он ниже барьера.',
    fit: ['def', 'sec'],
    cabinet: true,
  },
  {
    id: 'shas',
    name: 'ШАС',
    he: 'ש״ס',
    leader: 'Арье Дери',
    color: '#9A3412',
    bloc: 'netanyahu',
    poll: 7,
    lr: 8.2,
    about: 'Сефардская харедимная партия Арье Дери: социальные выплаты своим избирателям и союз с Нетаньяху.',
    fit: ['rel', 'welfare'],
    cabinet: true,
  },
  {
    id: 'utj',
    name: 'Яхадут ха-Тора',
    he: 'יהדות התורה',
    leader: 'Яаков Ашер',
    color: '#57534E',
    bloc: 'netanyahu',
    poll: 8,
    lr: 8.6,
    about: 'Ашкеназский харедимный список. Своего кандидата в премьеры нет, в опросах осени 2026 года его связывают с Яаковом Ашером.',
    fit: ['rel'],
    cabinet: true,
  },
  {
    id: 'rz',
    name: 'Религиозный сионизм - Зехут',
    he: 'הציונות הדתית',
    leader: 'Бецалель Смотрич',
    color: '#EA580C',
    bloc: 'netanyahu',
    poll: 6,
    lr: 9.1,
    about: 'Список Бецалеля Смотрича вместе с Зехут: поселения, суверенитет над Иудеей и Самарией, религиозный сионизм.',
    fit: ['def', 'sec'],
    cabinet: true,
  },
  {
    id: 'otzma',
    name: 'Оцма Йехудит',
    he: 'עוצמה יהודית',
    leader: 'Итамар Бен-Гвир',
    color: 'var(--party-otzma)',
    bloc: 'netanyahu',
    poll: 8,
    lr: 9.7,
    about: 'Партия Итамара Бен-Гвира. Крайне правые: поселения, полиция и продолжение войны до демонтажа ХАМАС.',
    fit: ['sec'],
    cabinet: true,
  },
]

export const blocs: { id: BlocId; name: string; ids: string[] }[] = [
  { id: 'netanyahu', name: 'Блок Нетаньяху', ids: ['likud', 'otzma', 'rz', 'shas', 'utj', 'amcha'] },
  { id: 'change', name: 'Блок перемен', ids: ['yashar', 'byachad', 'democrats', 'yb'] },
  { id: 'arab', name: 'Арабские списки', ids: ['joint', 'raam'] },
]

/** Пары, которые в кампании 2026 года не садятся в один кабинет. Редакционная оценка. */
export const vetoPairs: [string, string][] = [
  ['otzma', 'democrats'],
  ['otzma', 'yashar'],
  ['otzma', 'byachad'],
  ['otzma', 'yb'],
  ['otzma', 'raam'],
  ['otzma', 'joint'],
  ['rz', 'democrats'],
  ['rz', 'yashar'],
  ['rz', 'byachad'],
  ['rz', 'yb'],
  ['rz', 'raam'],
  ['rz', 'joint'],
  ['likud', 'joint'],
  ['likud', 'raam'],
  ['likud', 'democrats'],
  ['likud', 'yashar'],
  ['likud', 'byachad'],
  ['likud', 'yb'],
  ['shas', 'democrats'],
  ['shas', 'yb'],
  ['shas', 'yashar'],
  ['shas', 'byachad'],
  ['shas', 'raam'],
  ['shas', 'joint'],
  ['utj', 'democrats'],
  ['utj', 'yb'],
  ['utj', 'yashar'],
  ['utj', 'byachad'],
  ['utj', 'raam'],
  ['utj', 'joint'],
  ['amcha', 'democrats'],
  ['amcha', 'yashar'],
  ['amcha', 'byachad'],
  ['amcha', 'yb'],
  ['amcha', 'joint'],
  ['amcha', 'raam'],
]

const pmCandidates = new Set(['likud', 'yashar', 'byachad', 'democrats', 'yb'])

export function partyById(id: string) {
  const party = parties.find((item) => item.id === id)
  if (!party) throw new Error(`unknown party ${id}`)
  return party
}

export function canBePm(id: string) {
  return pmCandidates.has(id)
}

export { questions } from './questions'

export const posts: { id: string; name: string }[] = [
  { id: 'pm', name: 'Премьер-министр' },
  { id: 'def', name: 'Оборона' },
  { id: 'fin', name: 'Финансы' },
  { id: 'for', name: 'Иностранные дела' },
  { id: 'jus', name: 'Юстиция' },
  { id: 'sec', name: 'Национальная безопасность' },
  { id: 'rel', name: 'Религиозные службы' },
  { id: 'welfare', name: 'Благосостояние' },
]
