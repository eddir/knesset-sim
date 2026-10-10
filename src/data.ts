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
}

export type Question = {
  id: string
  theme: string
  title: string
  a: string
  b: string
  /** Куда тянет вариант Б: +1 дипломатия, −1 сила. */
  x: number
  /** Куда тянет вариант Б: +1 светские институты, −1 раввинат и большинство. */
  y: number
  stance: Record<string, number>
}

export const SEAT_COUNT = 120
export const MAJORITY = 61
export const THRESHOLD = 0.0325

export const themes: Theme[] = [
  { id: 'security', name: 'Война и сдерживание', hint: 'Газа, заложники, Иран' },
  { id: 'land', name: 'Территория', hint: 'Поселения, Газа после войны, аннексия' },
  { id: 'power', name: 'Власть и суд', hint: 'Нетаньяху, Верховный суд, комиссия' },
  { id: 'faith', name: 'Религия и призыв', hint: 'Харедим, шаббат, бюджеты ешив' },
  { id: 'money', name: 'Кошелёк', hint: 'Цены, жильё, военный бюджет' },
  { id: 'citizens', name: 'Граждане', hint: 'Арабские партии и закон о нации' },
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

function stance(row: number[]): Record<string, number> {
  const ids = ['likud', 'yashar', 'byachad', 'democrats', 'yb', 'joint', 'otzma', 'utj', 'shas', 'raam', 'rz', 'amcha']
  return Object.fromEntries(ids.map((id, index) => [id, row[index]]))
}

// Строка позиции: likud yashar byachad democrats yb joint otzma utj shas raam rz amcha
// −1 = вариант А, +1 = вариант Б
export const questions: Question[] = [
  {
    id: 'gaza',
    theme: 'security',
    title: 'Война в Газе',
    a: 'Продолжать, пока военное крыло ХАМАС не разобрано',
    b: 'Останавливать войну ради сделки и гражданского управления без ХАМАС',
    x: 1,
    y: 0.15,
    stance: stance([-0.8, 0.15, -0.45, 0.75, -0.35, 0.9, -1, -0.5, -0.45, 0.55, -1, -0.85]),
  },
  {
    id: 'hostages',
    theme: 'security',
    title: 'Заложники',
    a: 'Сначала военное давление, даже если обмен откладывается',
    b: 'Сделка об освобождении важнее продолжения операции',
    x: 0.85,
    y: 0,
    stance: stance([-0.55, 0.55, -0.1, 0.85, -0.2, 0.7, -1, -0.3, -0.35, 0.45, -0.85, -0.6]),
  },
  {
    id: 'iran',
    theme: 'security',
    title: 'Иран',
    a: 'Израиль вправе ударить по ядерной программе и без США',
    b: 'Только вместе с Вашингтоном и после того, как дипломатия исчерпана',
    x: 0.55,
    y: 0,
    stance: stance([-0.7, -0.25, -0.6, 0.35, -0.45, 0.55, -0.85, -0.4, -0.35, 0.15, -0.8, -0.65]),
  },
  {
    id: 'settlements',
    theme: 'land',
    title: 'Поселения',
    a: 'Строить и юридически закреплять поселения в Иудее и Самарии',
    b: 'Заморозить расширение поселений',
    x: 1,
    y: 0,
    stance: stance([-0.7, 0.25, -0.45, 0.9, -0.15, 1, -1, -0.5, -0.4, 0.75, -1, -0.75]),
  },
  {
    id: 'twostate',
    theme: 'land',
    title: 'Палестинское государство',
    a: 'Его не будет: никакого второго государства к западу от Иордана',
    b: 'Два государства остаются горизонтом, если будет партнёр по безопасности',
    x: 1,
    y: 0.15,
    stance: stance([-0.85, 0.35, -0.35, 0.95, -0.45, 1, -1, -0.55, -0.55, 0.85, -1, -0.7]),
  },
  {
    id: 'after',
    theme: 'land',
    title: 'Газа после ХАМАС',
    a: 'Израильский контроль безопасности на годы, без палестинской администрации',
    b: 'Гражданская власть арабских стран или обновлённой палестинской администрации',
    x: 0.8,
    y: 0,
    stance: stance([-0.65, 0.4, -0.25, 0.8, -0.2, 0.85, -1, -0.4, -0.35, 0.65, -0.95, -0.55]),
  },
  {
    id: 'annex',
    theme: 'land',
    title: 'Суверенитет',
    a: 'Распространить суверенитет Израиля на Иудею и Самарию',
    b: 'Не аннексировать территорию, где миллионы палестинцев без гражданства',
    x: 1,
    y: 0.1,
    stance: stance([-0.55, 0.45, -0.05, 0.9, 0.05, 1, -1, -0.45, -0.3, 0.95, -1, -0.5]),
  },
  {
    id: 'court',
    theme: 'power',
    title: 'Верховный суд',
    a: 'Оговорка преодоления: Кнессет может отменить решение суда',
    b: 'Суд остаётся проверкой власти большинства',
    x: 0.15,
    y: 1,
    stance: stance([-0.9, 0.8, 0.55, 1, 0.25, 0.65, -1, -0.7, -0.75, 0.5, -0.95, -0.4]),
  },
  {
    id: 'pm',
    theme: 'power',
    title: 'Кто формирует правительство',
    a: 'Следующий кабинет должен собирать Биньямин Нетаньяху',
    b: 'После 7 октября премьером должен быть кто-то другой',
    x: 0.35,
    y: 0.45,
    stance: stance([-1, 1, 0.95, 1, 0.85, 0.75, -0.9, -0.75, -0.85, 0.6, -0.85, -0.75]),
  },
  {
    id: 'inquiry',
    theme: 'power',
    title: 'Комиссия по 7 октября',
    a: 'Хватит внутренней проверки армии, государственная комиссия не нужна',
    b: 'Нужна независимая государственная комиссия с полномочиями',
    x: 0.25,
    y: 0.7,
    stance: stance([-0.95, 1, 0.7, 0.95, 0.55, 0.65, -0.55, -0.25, -0.45, 0.4, -0.7, -0.55]),
  },
  {
    id: 'draft',
    theme: 'faith',
    title: 'Призыв харедим',
    a: 'Ученики ешив по-прежнему не идут в армию',
    b: 'Служба или потеря льгот и бюджета ешив',
    x: 0,
    y: 0.85,
    stance: stance([-0.35, 0.75, 0.8, 0.85, 1, 0.2, 0.15, -1, -1, 0.1, -0.45, 0.7]),
  },
  {
    id: 'shabbat',
    theme: 'faith',
    title: 'Раввинат и шаббат',
    a: 'Брак, кашрут и шаббат остаются у Главного раввината',
    b: 'Гражданский брак и общественный транспорт в шаббат',
    x: 0.05,
    y: 1,
    stance: stance([-0.35, 0.6, 0.45, 1, 0.75, 0.45, -0.7, -1, -1, -0.35, -0.9, -0.25]),
  },
  {
    id: 'yeshiva',
    theme: 'faith',
    title: 'Деньги ешив',
    a: 'Сохранить бюджеты ешив и пособия многодетным харедимным семьям',
    b: 'Привязать трансферты к работе и к светскому ядру в школе',
    x: 0,
    y: 0.9,
    stance: stance([-0.4, 0.6, 0.7, 0.8, 0.95, 0.25, 0.05, -1, -1, 0, -0.55, 0.55]),
  },
  {
    id: 'prices',
    theme: 'money',
    title: 'Цены',
    a: 'Снижать налоги и регулирование, даже если поддержка бедных сократится',
    b: 'Субсидии, контроль цен и более толстый социальный бюджет',
    x: 0.15,
    y: 0.25,
    stance: stance([-0.55, 0.15, -0.4, 0.8, -0.5, 0.95, -0.15, 0.35, 0.55, 0.6, -0.25, -0.45]),
  },
  {
    id: 'budget',
    theme: 'money',
    title: 'Бюджет после войны',
    a: 'Военные расходы важнее, дефицит можно нарастить',
    b: 'Вернуть деньги жилью, больницам и школам',
    x: 0.4,
    y: 0.25,
    stance: stance([-0.6, 0.15, -0.3, 0.7, -0.35, 0.8, -0.75, 0.1, -0.1, 0.55, -0.7, -0.45]),
  },
  {
    id: 'housing',
    theme: 'money',
    title: 'Жильё',
    a: 'Цены собьёт рынок: быстрее разрешения и меньше контроля аренды',
    b: 'Потолок аренды и большое общественное жильё',
    x: 0.1,
    y: 0.2,
    stance: stance([-0.5, 0.2, -0.25, 0.75, -0.35, 0.9, -0.1, 0.25, 0.45, 0.55, -0.2, -0.4]),
  },
  {
    id: 'arab',
    theme: 'citizens',
    title: 'Арабские партии в кабинете',
    a: 'Правительство только из сионистских списков',
    b: 'Арабские партии могут быть партнёрами по коалиции',
    x: 0.7,
    y: 0.35,
    stance: stance([-0.85, 0.5, 0.45, 0.85, -0.25, 1, -1, -0.4, -0.55, 1, -1, -0.7]),
  },
  {
    id: 'nation',
    theme: 'citizens',
    title: 'Закон о национальном государстве',
    a: 'Оставить жёстким: Израиль прежде всего государство еврейского народа',
    b: 'Смягчить ради равного статуса арабских граждан',
    x: 0.75,
    y: 0.45,
    stance: stance([-0.8, 0.3, -0.2, 0.85, -0.4, 1, -1, -0.35, -0.5, 1, -1, -0.65]),
  },
]

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
