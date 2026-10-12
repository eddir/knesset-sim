import { createContext, useContext } from 'react'
import { bills } from './bills'
import { parties, partyById, questions, themes, posts } from './data'

export type Locale = 'ru' | 'en' | 'he'

export const locales: Locale[] = ['ru', 'en', 'he']

const LANG_KEY = 'knesset-lang'

export function loadLocale(): Locale {
  try {
    const saved = localStorage.getItem(LANG_KEY)
    if (saved === 'ru' || saved === 'en' || saved === 'he') return saved
  } catch {
    /* private mode */
  }
  return 'ru'
}

export function saveLocale(locale: Locale) {
  localStorage.setItem(LANG_KEY, locale)
}

function ruSeats(seats: number) {
  const mod10 = seats % 10
  const mod100 = seats % 100
  const word = mod10 === 1 && mod100 !== 11 ? 'место' : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14) ? 'места' : 'мест'
  return `${seats} ${word}`
}

type PartyBits = { name: string; leader: string }
type QuestionBits = { title: string; a: string; b: string }
type ThemeBits = { name: string; hint: string; lo: string; hi: string }

const enParties: Record<string, PartyBits> = {
  joint: { name: 'Joint List', leader: 'Yousef Jabareen' },
  democrats: { name: 'The Democrats', leader: 'Yair Golan' },
  raam: { name: "Ra'am", leader: 'Mansour Abbas' },
  yashar: { name: 'Yashar', leader: 'Gadi Eisenkot' },
  byachad: { name: 'Beyachad', leader: 'Naftali Bennett' },
  yb: { name: 'Yisrael Beiteinu', leader: 'Avigdor Lieberman' },
  likud: { name: 'Likud', leader: 'Benjamin Netanyahu' },
  amcha: { name: 'Am Yisrael', leader: 'Ofer Winter' },
  shas: { name: 'Shas', leader: 'Aryeh Deri' },
  utj: { name: 'United Torah Judaism', leader: 'Yaakov Asher' },
  rz: { name: 'Religious Zionism - Zehut', leader: 'Bezalel Smotrich' },
  otzma: { name: 'Otzma Yehudit', leader: 'Itamar Ben-Gvir' },
}

const heLeaders: Record<string, string> = {
  joint: 'יוסף ג׳בארין',
  democrats: 'יאיר גולן',
  raam: 'מנסור עבאס',
  yashar: 'גדי איזנקוט',
  byachad: 'נפתלי בנט',
  yb: 'אביגדור ליברמן',
  likud: 'בנימין נתניהו',
  amcha: 'עופר וינטר',
  shas: 'אריה דרעי',
  utj: 'יעקב אשר',
  rz: 'בצלאל סמוטריץ׳',
  otzma: 'איתמר בן גביר',
}

const enThemes: Record<string, ThemeBits> = {
  security: { name: 'War and deterrence', hint: 'Gaza, the north, the hostages, Iran', lo: 'Hard force', hi: 'A deal and a pause' },
  land: { name: 'Territory', hint: 'Settlements, Jerusalem, Gaza after the war', lo: 'Control and sovereignty', hi: 'Separation' },
  power: { name: 'Power and the court', hint: 'Netanyahu, the Supreme Court, the police', lo: 'Majority power', hi: 'Checks and the court' },
  faith: { name: 'Religion and the draft', hint: 'Haredim, Shabbat, the rabbinate', lo: 'The rabbinate’s status quo', hi: 'Secular rules' },
  money: { name: 'Money', hint: 'Prices, housing, taxes', lo: 'The market and low taxes', hi: 'A social budget' },
  citizens: { name: 'Citizens', hint: 'Arab citizens, equality, the Nation-State Law', lo: 'A Jewish state', hi: 'Equal status' },
  world: { name: 'Foreign policy', hint: 'The US, the accords, the rules after the election', lo: 'Self-reliance', hi: 'Alliances and norms' },
}

const heThemes: Record<string, ThemeBits> = {
  security: { name: 'מלחמה והרתעה', hint: 'עזה, הצפון, חטופים, איראן', lo: 'כוח קשיח', hi: 'עסקה והפוגה' },
  land: { name: 'שטח', hint: 'התנחלויות, ירושלים, עזה אחרי המלחמה', lo: 'שליטה וריבונות', hi: 'היפרדות' },
  power: { name: 'שלטון ובית המשפט', hint: 'נתניהו, בג״ץ, המשטרה', lo: 'שלטון הרוב', hi: 'בלמים ובית המשפט' },
  faith: { name: 'דת וגיוס', hint: 'חרדים, שבת, הרבנות', lo: 'הסטטוס קוו של הרבנות', hi: 'כללים חילוניים' },
  money: { name: 'הכיס', hint: 'מחירים, דיור, מסים', lo: 'שוק ומסים נמוכים', hi: 'תקציב חברתי' },
  citizens: { name: 'אזרחים', hint: 'אזרחים ערבים, שוויון, חוק הלאום', lo: 'מדינה יהודית', hi: 'מעמד שווה' },
  world: { name: 'מדיניות חוץ', hint: 'ארה״ב, ההסכמים, הכללים אחרי הבחירות', lo: 'הישענות על עצמנו', hi: 'בריתות ונורמות' },
}

const enPosts: Record<string, string> = {
  pm: 'Prime minister',
  def: 'Defense',
  fin: 'Finance',
  for: 'Foreign affairs',
  jus: 'Justice',
  sec: 'National security',
  rel: 'Religious services',
  welfare: 'Welfare',
}

const hePosts: Record<string, string> = {
  pm: 'ראש הממשלה',
  def: 'ביטחון',
  fin: 'אוצר',
  for: 'חוץ',
  jus: 'משפטים',
  sec: 'ביטחון לאומי',
  rel: 'שירותי דת',
  welfare: 'רווחה',
}

const scenarioCopy: Record<Locale, Record<string, { name: string; note: string }>> = {
  ru: {
    right: {
      name: 'Блок Нетаньяху',
      note: 'Ликуд, религиозная правая и харедимные списки, у которых есть мандаты.',
    },
    change: {
      name: 'Блок перемен',
      note: 'Яшар, Бейахад, Демократы и Наш дом Израиль. Без арабских списков.',
    },
    raam: {
      name: 'Блок перемен и РААМ',
      note: 'Так уже собирали кабинет в 2021 году: сионистская оппозиция плюс РААМ Мансура Аббаса.',
    },
    outside: {
      name: 'Меньшинство с внешней поддержкой',
      note: 'Объединённый список не входит в кабинет. Голоса за инвеституру возможны только если на это пойдёт весь список, включая Балад. Это развилка, не договор.',
    },
  },
  en: {
    right: {
      name: 'Netanyahu bloc',
      note: 'Likud, the religious right and the Haredi lists that won seats.',
    },
    change: {
      name: 'Change bloc',
      note: 'Yashar, Beyachad, the Democrats and Yisrael Beiteinu. No Arab lists.',
    },
    raam: {
      name: "Change bloc and Ra'am",
      note: "This is how a cabinet was built in 2021: the Zionist opposition plus Mansour Abbas's Ra'am.",
    },
    outside: {
      name: 'A minority with outside support',
      note: 'The Joint List does not enter the cabinet. Votes for the investiture are possible only if the whole list, including Balad, agrees. This is a fork, not a deal.',
    },
  },
  he: {
    right: {
      name: 'גוש נתניהו',
      note: 'הליכוד, הימין הדתי והרשימות החרדיות שיש להן מנדטים.',
    },
    change: {
      name: 'גוש השינוי',
      note: 'ישר, ביחד, הדמוקרטים וישראל ביתנו. בלי רשימות ערביות.',
    },
    raam: {
      name: 'גוש השינוי ורע״מ',
      note: 'כך כבר הרכיבו ממשלה ב־2021: האופוזיציה הציונית ועוד רע״מ של מנסור עבאס.',
    },
    outside: {
      name: 'מיעוט עם תמיכה מבחוץ',
      note: 'הרשימה המשותפת לא נכנסת לממשלה. קולות להשבעה אפשריים רק אם כל הרשימה, כולל בל״ד, תסכים. זו פרשת דרכים, לא הסכם.',
    },
  },
}

export function scenarioText(locale: Locale, id: string) {
  return scenarioCopy[locale][id] ?? scenarioCopy.ru[id]
}

export function partyName(locale: Locale, id: string) {
  if (locale === 'he') return partyById(id).he
  if (locale === 'en') return enParties[id]?.name ?? partyById(id).name
  return partyById(id).name
}

export function partyLeader(locale: Locale, id: string) {
  if (locale === 'he') return heLeaders[id] ?? partyById(id).leader
  if (locale === 'en') return enParties[id]?.leader ?? partyById(id).leader
  return partyById(id).leader
}

export function leaderOf(locale: Locale, id: string | null) {
  if (!id) return locale === 'he' ? 'אין מועמד' : locale === 'en' ? 'no one' : 'некому'
  return partyLeader(locale, id)
}

export function questionText(locale: Locale, id: string): QuestionBits {
  const source = questions.find((item) => item.id === id)
  if (!source) return { title: id, a: '', b: '' }
  return { title: source.title[locale], a: source.a[locale], b: source.b[locale] }
}

export function themeText(locale: Locale, id: string): ThemeBits {
  const source = themes.find((item) => item.id === id)
  const fallback = { name: source?.name ?? id, hint: source?.hint ?? '', lo: source?.lo ?? '', hi: source?.hi ?? '' }
  if (locale === 'en') return enThemes[id] ?? fallback
  if (locale === 'he') return heThemes[id] ?? fallback
  return fallback
}

export function billText(locale: Locale, id: string) {
  const bill = bills.find((item) => item.id === id)
  if (!bill) return { title: id, body: '' }
  return { title: bill.title[locale], body: bill.body[locale] }
}

export function postName(locale: Locale, id: string) {
  const source = posts.find((item) => item.id === id)
  if (locale === 'en') return enPosts[id] ?? source?.name ?? id
  if (locale === 'he') return hePosts[id] ?? source?.name ?? id
  return source?.name ?? id
}

export function numberLocale(locale: Locale) {
  if (locale === 'en') return 'en-US'
  if (locale === 'he') return 'he-IL'
  return 'ru-RU'
}

type Ui = {
  pageTitle: string
  brandKicker: string
  brand: string
  methodButton: string
  methodTitle: string
  methodLead: string
  methodParas: string[]
  close: string
  lightTheme: string
  darkTheme: string
  language: string
  date: string
  introTitle: string
  introLead: (count: number) => string
  next: string
  sliderUnset: string
  sliderMid: string
  sliderSlight: (side: string) => string
  sliderClear: (side: string) => string
  sliderFull: (side: string) => string
  sectionKicker: (current: number, total: number) => string
  sectionTitle: (name: string, seats: number) => string
  seatsAtStake: (seats: number) => string
  sectionNext: (name: string) => string
  sectionDone: string
  sectionMajority: (name: string) => string
  sectionAhead: (name: string) => string
  sectionKeeps: (name: string) => string
  sectionTakes: (name: string) => string
  sectionLeft: (seats: number) => string
  distributed: (done: number, total: number) => string
  majorityMark: string
  onTheme: string
  wikiTitle: string
  wikiLead: string
  wikiElection: string
  wikiWhen: string
  wikiByAnswers: string
  wikiHall: (seats: number) => string
  wikiNeed: (seats: number) => string
  wikiConst: (seats: number) => string
  wikiLeader: string
  wikiParty: string
  wikiWon: string
  wikiShare: string
  wikiPolls: string
  wikiOthers: string
  wikiSystem: string
  wikiSystemValue: string
  wikiBarrier: string
  wikiCaption: string
  wikiNone: string
  themeShareTitle: string
  themeShareLead: string
  billsTitle: string
  billsLead: string
  billPass: string
  billFail: string
  billYes: string
  billNo: string
  billHold: string
  stripsTitle: string
  stripsLead: string
  byQuestion: (count: number) => string
  closestTag: string
  noOpinion: string
  youMark: string
  seatsShort: string
  thresholdShort: string
  majorityShort: string
  start: string
  skipToQuestions: string
  pollNow: (right: number, change: number) => string
  hemicycleSub: string
  figcaption: string
  step: string
  weightsTitle: string
  weightsLead: string
  weights: string[]
  toQuestions: string
  questionOf: (current: number, total: number) => string
  option: (mark: string) => string
  marks: [string, string]
  answerLabel: string
  choices: string[]
  back: string
  skip: string
  keysHint: string
  draft: string
  yourKnesset: string
  fewAnswers: string
  closestBefore: string
  matchWord: string
  whoBuilds: string
  enough: (outside: boolean) => string
  shortBy: (gap: number) => string
  outsidePrefix: string
  pmCandidate: (leader: string) => string
  shortestTitle: string
  shortestLead: string
  primeWord: string
  portfolios: string
  portfoliosLead: string
  outlookCaveat: string
  besidePolls: string
  besideLead: string
  colList: string
  colYou: string
  colPolls: string
  belowWord: string
  belowLine: (list: string) => string
  whereTitle: string
  whereLead: string
  copy: string
  copied: string
  editAnswers: string
  restart: string
  disclaimer: string
  shareText: (lines: string, verdict: string) => string
  compassAria: string
  compassTop: string
  compassBottom: string
  compassLeft: string
  compassRight: string
  compassYou: string
}

export const ui: Record<Locale, Ui> = {
  ru: {
    pageTitle: 'Симулятор Кнессета · 2026',
    brandKicker: '26-й Кнессет',
    brand: 'Симулятор',
    methodButton: 'Как считается',
    methodTitle: 'Как собирается Кнессет',
    methodLead: 'Выборы 27 октября 2026 года, 26-й Кнессет. Модель повторяет правила, а не прогноз ЦИК.',
    methodParas: [
      'Один общенациональный округ, закрытые списки, 120 мандатов. Список ниже 3,25% действительных голосов не получает ничего, его голоса уходят остальным.',
      'Мандаты делятся методом Бадера-Офера: это метод д’Ондта. Каждый следующий мандат забирает список с наибольшим частным «голоса / (уже полученные места + 1)».',
      'Правительству нужны 61 голос. Соглашения об излишках между списками здесь не включены. Отказы сидеть в одном кабинете заданы по линиям кампании 2026 года: это редакционная оценка, не юридический запрет.',
      'Ваши ответы не выбирают одну партию. Они собирают Кнессет так, как если бы страна ответила так же. Близкие списки делят голоса, далёкие проваливаются под барьер.',
      'Вопросы разбиты на разделы. Раздел с весом «не важно» пропускается. Остальные идут от менее важных к более важным. После каждого раздела места, которые уже разыграны, показываются в зале. В конце отчёт разбирает коалиции, законопроекты и каждый ответ.',
      'Цифры опросов на первом экране - округлённое среднее опубликованных мандатных прогнозов начала октября 2026 года. «Народ Израиля» Офера Винтера в этом среднем ниже барьера.',
    ],
    close: 'Закрыть',
    lightTheme: 'Светлая тема',
    darkTheme: 'Тёмная тема',
    language: 'Язык',
    date: '27 октября 2026',
    introTitle: 'Соберите Кнессет своими ответами',
    introLead: (count) => `${count} вопросов в семи разделах: война, территория, суд, религия, кошелёк, граждане и внешняя политика. После каждого раздела зал показывает, сколько мест уже разыграно. В конце подробный отчёт: 120 мандатов, барьер 3,25% и проверка кабинета на 61.`,
    seatsShort: 'мест',
    thresholdShort: 'барьер',
    majorityShort: 'для кабинета',
    start: 'Начать',
    skipToQuestions: 'Сразу к вопросам',
    pollNow: (right, change) => `Сейчас ни блок Нетаньяху (${right}), ни блок перемен (${change}) не дотягивают до 61. Так выглядит среднее опросов начала октября, не ваш результат.`,
    hemicycleSub: 'мандатов',
    figcaption: 'Ликуд и Яшар по 23. РААМ и Объединённый список держат отдельный карман мандатов.',
    step: 'Шаг 1',
    weightsTitle: 'Что для вас решает выборы',
    weightsLead: '«Не важно» пропускает раздел целиком. Остальные идут от менее важных к более важным, и после каждого зал обновляется. По умолчанию все темы одинаково важны.',
    weights: ['Не важно', 'Слабо', 'Важно', 'Решающе'],
    toQuestions: 'К вопросам',
    questionOf: (current, total) => `Вопрос ${current} из ${total}`,
    option: (mark) => `Вариант ${mark}`,
    marks: ['А', 'Б'],
    answerLabel: 'Ответ',
    choices: ['Первый', 'Скорее первый', 'Середина', 'Скорее второй', 'Второй'],
    back: 'Назад',
    skip: 'Пропустить',
    next: 'Дальше',
    sliderUnset: 'Сдвиньте ползунок к варианту, который вам ближе',
    sliderMid: 'Ровно посередине',
    sliderSlight: (side) => `Немного ближе к ${side}`,
    sliderClear: (side) => `Заметно ближе к ${side}`,
    sliderFull: (side) => `Полностью за ${side}`,
    sectionKicker: (current, total) => `Раздел ${current} из ${total}`,
    sectionTitle: (name, seats) => `«${name}» раздаёт ${ruSeats(seats)}`,
    seatsAtStake: (seats) => `${ruSeats(seats)} на кону`,
    sectionNext: (name) => `Дальше: ${name}`,
    sectionDone: 'Показать мой Кнессет',
    sectionMajority: (name) => `${name}: абсолютное большинство`,
    sectionAhead: (name) => `${name} выходит вперёд`,
    sectionKeeps: (name) => `${name} сохраняет лидерство`,
    sectionTakes: (name) => `${name} перехватывает лидерство`,
    sectionLeft: (seats) => `Впереди ещё ${seats}`,
    distributed: (done, total) => `Распределено ${done} из ${total}`,
    majorityMark: 'Абсолютное большинство: 61',
    onTheme: 'По ответам в этом разделе',
    wikiTitle: 'Итоги выборов',
    wikiLead: 'Карточка в оформлении Википедии. Её удобно сохранить снимком экрана.',
    wikiElection: 'Выборы в Кнессет',
    wikiWhen: '27 октября 2026',
    wikiByAnswers: 'по ответам на тест',
    wikiHall: (seats) => `Все ${ruSeats(seats)} в Кнессете`,
    wikiNeed: (seats) => `Для большинства необходимо ${ruSeats(seats)}`,
    wikiConst: (seats) => `Конституционное большинство: ${seats}`,
    wikiLeader: 'Лидер',
    wikiParty: 'Партия',
    wikiWon: 'Мест получено',
    wikiShare: 'Доля мест',
    wikiPolls: 'Опросы',
    wikiOthers: 'Остальные',
    wikiSystem: 'Система',
    wikiSystemValue: 'Один округ, закрытые списки',
    wikiBarrier: 'Барьер',
    wikiCaption: 'Распределение мест по итогам теста',
    wikiNone: 'Кабинет на 61 не собран',
    themeShareTitle: 'Голоса по разделам',
    themeShareLead: 'Доля каждого списка внутри раздела. Это не второй подсчёт мандатов: мандаты в зале посчитаны по всем ответам сразу.',
    billsTitle: 'Что этот Кнессет провёл бы',
    billsLead: 'Законопроект проходит, если за него 61 и больше. Список голосует по своей позиции на близком вопросе: середина воздерживается.',
    billPass: 'Проходит',
    billFail: 'Не набирает 61',
    billYes: 'за',
    billNo: 'против',
    billHold: 'воздержались',
    stripsTitle: 'Где вы по каждому разделу',
    stripsLead: 'Белый кружок: ваша средняя позиция. Цветные: средние позиции списков. Раскройте раздел, чтобы увидеть каждый вопрос и кто оказался ближе.',
    byQuestion: (count) => `Вопрос за вопросом (${count})`,
    closestTag: 'Ближе всего',
    noOpinion: 'Без мнения',
    youMark: 'Вы',
    keysHint: 'Стрелки двигают ползунок, 1–5 ставят деления, Enter дальше, 0 пропуск, Backspace назад.',
    draft: 'Черновик Кнессета по уже данным ответам',
    yourKnesset: 'Ваш 26-й Кнессет',
    fewAnswers: 'Ответов мало, поэтому расклад ближе к ровному дележу, чем к настоящей кампании.',
    closestBefore: 'Ближе всего к ответам',
    matchWord: 'Совпадение',
    whoBuilds: 'Кто собирает 61',
    enough: (outside) => `Хватает на большинство${outside ? ' только с внешней поддержкой' : ''}`,
    shortBy: (gap) => `Не хватает ${gap}`,
    outsidePrefix: 'извне',
    pmCandidate: (leader) => `Кандидат в премьеры: ${leader}`,
    shortestTitle: 'Самые короткие кабинеты',
    shortestLead: 'Составы без лишней партии: если убрать кого-то одного, 61 уже нет. Пары, которые отказались сидеть вместе, сюда не попадают.',
    primeWord: 'премьер',
    portfolios: 'Портфели',
    portfoliosLead: 'Черновая раскладка по тому, какой список в этом большинстве ближе к теме портфеля. Это не коалиционное соглашение.',
    outlookCaveat: 'Сценарий по вашим ответам, не прогноз на 2030 год.',
    besidePolls: 'Рядом с опросами',
    besideLead: 'Слева ваш Кнессет, справа среднее мандатных прогнозов начала октября 2026 года.',
    colList: 'Список',
    colYou: 'Вы',
    colPolls: 'Опросы',
    belowWord: 'барьер',
    belowLine: (list) => `Ниже барьера 3,25%: ${list}.`,
    whereTitle: 'Где вы стоите',
    whereLead: 'Горизонталь: от силы и территории к сделке. Вертикаль: от раввината и власти большинства к суду и светским правилам. Точка «вы» считается по тем же вопросам.',
    copy: 'Скопировать расклад',
    copied: 'Скопировано',
    editAnswers: 'Изменить ответы',
    restart: 'Сначала',
    disclaimer: 'Позиции списков - редакционная оценка по публичным заявлениям на осень 2026 года. Кнессет распущен 17 июля 2026 года, голосование назначено на 27 октября. Проект не связан с Центральной избирательной комиссией и не является избирательной агитацией.',
    shareText: (lines, verdict) => `Мой Кнессет-2026: ${lines}. ${verdict}`,
    compassAria: 'Политические координаты',
    compassTop: 'Светские институты',
    compassBottom: 'Раввинат и большинство',
    compassLeft: 'Сила и территория',
    compassRight: 'Сделка и гражданское',
    compassYou: 'Вы',
  },
  en: {
    pageTitle: 'Knesset simulator · 2026',
    brandKicker: '26th Knesset',
    brand: 'Simulator',
    methodButton: 'How it counts',
    methodTitle: 'How the Knesset is built',
    methodLead: 'The election is on 27 October 2026, for the 26th Knesset. The model follows the rules. It is not a Central Elections Committee forecast.',
    methodParas: [
      'One nationwide district, closed lists, 120 seats. A list under 3.25% of valid votes gets nothing, and its votes go to the others.',
      'Seats are allocated by the Bader-Ofer method, which is the D’Hondt method. Each next seat goes to the list with the highest votes / (seats already won + 1).',
      'A government needs 61 votes. Surplus-vote agreements between lists are not included. Refusals to sit together follow the lines of the 2026 campaign: an editorial judgment, not a legal ban.',
      'Your answers do not pick a single party. They build a Knesset as if the country answered the same way. Close lists split the vote. Distant ones fall under the threshold.',
      'Questions are grouped into sections. A section marked “not important” is skipped. The rest run from less important to more important. After each section the hall shows how many seats are already assigned. The final report covers coalitions, bills, and every answer.',
      'The polling figures on the first screen are a rounded average of published seat forecasts from early October 2026. Ofer Winter’s Am Yisrael is under the threshold in that average.',
    ],
    close: 'Close',
    lightTheme: 'Light theme',
    darkTheme: 'Dark theme',
    language: 'Language',
    date: '27 October 2026',
    introTitle: 'Build the Knesset with your answers',
    introLead: (count) => `${count} questions in seven sections: war, territory, the court, religion, money, citizens, and foreign policy. After each section the hall shows how many seats are already assigned. The end is a full report: 120 seats, a 3.25% threshold, and a check on a cabinet of 61.`,
    seatsShort: 'seats',
    thresholdShort: 'threshold',
    majorityShort: 'for a cabinet',
    start: 'Start',
    skipToQuestions: 'Skip to the questions',
    pollNow: (right, change) => `Right now neither the Netanyahu bloc (${right}) nor the change bloc (${change}) reaches 61. That is the early-October polling average, not your result.`,
    hemicycleSub: 'seats',
    figcaption: "Likud and Yashar have 23 each. Ra'am and the Joint List hold a separate pocket of seats.",
    step: 'Step 1',
    weightsTitle: 'What decides the election for you',
    weightsLead: '“Not important” skips the section. The rest run from less important to more important, and the hall updates after each one. By default every theme weighs the same.',
    weights: ['Not important', 'A little', 'Important', 'Decisive'],
    toQuestions: 'To the questions',
    questionOf: (current, total) => `Question ${current} of ${total}`,
    option: (mark) => `Option ${mark}`,
    marks: ['A', 'B'],
    answerLabel: 'Answer',
    choices: ['First', 'Leaning first', 'Middle', 'Leaning second', 'Second'],
    back: 'Back',
    skip: 'Skip',
    next: 'Next',
    sliderUnset: 'Move the slider toward the option closer to you',
    sliderMid: 'Right in the middle',
    sliderSlight: (side) => `A little closer to ${side}`,
    sliderClear: (side) => `Clearly closer to ${side}`,
    sliderFull: (side) => `Fully for ${side}`,
    sectionKicker: (current, total) => `Section ${current} of ${total}`,
    sectionTitle: (name, seats) => `${name} assigns ${seats} ${seats === 1 ? 'seat' : 'seats'}`,
    seatsAtStake: (seats) => `${seats} ${seats === 1 ? 'seat' : 'seats'} in play`,
    sectionNext: (name) => `Next: ${name}`,
    sectionDone: 'Show my Knesset',
    sectionMajority: (name) => `${name}: an absolute majority`,
    sectionAhead: (name) => `${name} moves ahead`,
    sectionKeeps: (name) => `${name} keeps the lead`,
    sectionTakes: (name) => `${name} takes the lead`,
    sectionLeft: (seats) => `${seats} seats still ahead`,
    distributed: (done, total) => `${done} of ${total} assigned`,
    majorityMark: 'Absolute majority: 61',
    onTheme: 'From your answers in this section',
    wikiTitle: 'Election results',
    wikiLead: 'A card in the style of a Wikipedia infobox. It is easy to save as a screenshot.',
    wikiElection: 'Knesset election',
    wikiWhen: '27 October 2026',
    wikiByAnswers: 'from your answers',
    wikiHall: (seats) => `All ${seats} seats in the Knesset`,
    wikiNeed: (seats) => `${seats} seats needed for a majority`,
    wikiConst: (seats) => `Constitutional majority: ${seats}`,
    wikiLeader: 'Leader',
    wikiParty: 'Party',
    wikiWon: 'Seats won',
    wikiShare: 'Share of seats',
    wikiPolls: 'Polls',
    wikiOthers: 'The rest',
    wikiSystem: 'System',
    wikiSystemValue: 'One district, closed lists',
    wikiBarrier: 'Threshold',
    wikiCaption: 'Seats at the end of the test',
    wikiNone: 'No cabinet reaches 61',
    themeShareTitle: 'Votes by section',
    themeShareLead: 'Each list’s share inside the section. This is not a second seat count: the seats in the hall are counted from every answer together.',
    billsTitle: 'What this Knesset would pass',
    billsLead: 'A bill passes at 61 or more. A list votes from its position on the nearest question. The middle abstains.',
    billPass: 'Passes',
    billFail: 'Short of 61',
    billYes: 'for',
    billNo: 'against',
    billHold: 'abstained',
    stripsTitle: 'Where you stand in each section',
    stripsLead: 'The white dot is your average. The colored dots are the lists. Open a section to see each question and who came closest.',
    byQuestion: (count) => `Question by question (${count})`,
    closestTag: 'Closest',
    noOpinion: 'No opinion',
    youMark: 'You',
    keysHint: 'Arrows move the slider, 1–5 snap to the ticks, Enter continues, 0 skips, Backspace goes back.',
    draft: 'A draft Knesset from the answers so far',
    yourKnesset: 'Your 26th Knesset',
    fewAnswers: 'There are few answers, so the result is closer to an even split than to a real campaign.',
    closestBefore: 'Closest to your answers',
    matchWord: 'Match',
    whoBuilds: 'Who gets to 61',
    enough: (outside) => `Enough for a majority${outside ? ' only with outside support' : ''}`,
    shortBy: (gap) => `Short by ${gap}`,
    outsidePrefix: 'outside',
    pmCandidate: (leader) => `Candidate for prime minister: ${leader}`,
    shortestTitle: 'The shortest cabinets',
    shortestLead: 'Lineups with no spare party: drop any one of them and 61 is gone. Pairs that refused to sit together are left out.',
    primeWord: 'prime minister',
    portfolios: 'Portfolios',
    portfoliosLead: 'A rough split by which list in this majority is closer to the portfolio. This is not a coalition agreement.',
    outlookCaveat: 'A scenario from your answers, not a forecast for 2030.',
    besidePolls: 'Next to the polls',
    besideLead: 'Your Knesset is on the left. The early-October 2026 seat-forecast average is on the right.',
    colList: 'List',
    colYou: 'You',
    colPolls: 'Polls',
    belowWord: 'threshold',
    belowLine: (list) => `Under the 3.25% threshold: ${list}.`,
    whereTitle: 'Where you stand',
    whereLead: 'Horizontal: from force and territory toward a deal. Vertical: from the rabbinate and majority rule toward the court and secular rules. The “you” point uses the same questions.',
    copy: 'Copy the result',
    copied: 'Copied',
    editAnswers: 'Edit answers',
    restart: 'Start over',
    disclaimer: 'List positions are an editorial reading of public statements in autumn 2026. The Knesset was dissolved on 17 July 2026, and the vote is set for 27 October. This project is not affiliated with the Central Elections Committee and is not campaign material.',
    shareText: (lines, verdict) => `My Knesset 2026: ${lines}. ${verdict}`,
    compassAria: 'Political coordinates',
    compassTop: 'Secular institutions',
    compassBottom: 'Rabbinate and majority',
    compassLeft: 'Force and territory',
    compassRight: 'A deal and civil life',
    compassYou: 'You',
  },
  he: {
    pageTitle: 'סימולטור הכנסת · 2026',
    brandKicker: 'הכנסת ה־26',
    brand: 'סימולטור',
    methodButton: 'איך זה מחושב',
    methodTitle: 'איך נבנית הכנסת',
    methodLead: 'הבחירות ב־27 באוקטובר 2026, לכנסת ה־26. המודל עוקב אחרי הכללים, לא אחרי תחזית ועדת הבחירות.',
    methodParas: [
      'אזור בחירה ארצי אחד, רשימות סגורות, 120 מנדטים. רשימה מתחת ל־3.25% מהקולות הכשרים לא מקבלת כלום, והקולות שלה עוברים לאחרות.',
      'המנדטים מתחלקים בשיטת בדר־עופר, שהיא שיטת ד׳ונדט. כל מנדט הבא הולך לרשימה עם המנה הגבוהה ביותר: קולות / (מנדטים שכבר קיבלה + 1).',
      'לממשלה צריך 61 קולות. הסכמי עודפים בין רשימות לא כלולים כאן. סירובים לשבת יחד נקבעו לפי קווי הקמפיין של 2026: זו הערכת מערכת, לא איסור משפטי.',
      'התשובות לא בוחרות מפלגה אחת. הן בונות כנסת כאילו המדינה ענתה אותו דבר. רשימות קרובות מתחלקות בקולות, רחוקות נופלות מתחת לאחוז החסימה.',
      'השאלות מחולקות למדורים. מדור במשקל «לא חשוב» מדולג. השאר רצים מהפחות חשוב אל החשוב יותר. אחרי כל מדור האולם מראה כמה מנדטים כבר חולקו. בסוף יש דוח: קואליציות, הצעות חוק וכל תשובה.',
      'מספרי הסקרים במסך הראשון הם ממוצע מעוגל של תחזיות מנדטים שפורסמו בתחילת אוקטובר 2026. «עם ישראל» של עופר וינטר נמצא בממוצע הזה מתחת לאחוז החסימה.',
    ],
    close: 'סגירה',
    lightTheme: 'ערכת בהירה',
    darkTheme: 'ערכת כהה',
    language: 'שפה',
    date: '27 באוקטובר 2026',
    introTitle: 'בנו את הכנסת מהתשובות שלכם',
    introLead: (count) => `${count} שאלות בשבעה מדורים: מלחמה, שטח, בית המשפט, דת, כיס, אזרחים ומדיניות חוץ. אחרי כל מדור האולם מראה כמה מנדטים כבר חולקו. בסוף דוח מפורט: 120 מנדטים, אחוז חסימה 3.25%, ובדיקה אם יש ממשלה עם 61.`,
    seatsShort: 'מושבים',
    thresholdShort: 'אחוז חסימה',
    majorityShort: 'לממשלה',
    start: 'התחלה',
    skipToQuestions: 'ישר לשאלות',
    pollNow: (right, change) => `כרגע לא גוש נתניהו (${right}) ולא גוש השינוי (${change}) מגיעים ל־61. זה ממוצע הסקרים מתחילת אוקטובר, לא התוצאה שלכם.`,
    hemicycleSub: 'מנדטים',
    figcaption: 'הליכוד וישר עם 23 כל אחד. לרע״מ ולרשימה המשותפת כיס מנדטים נפרד.',
    step: 'שלב 1',
    weightsTitle: 'מה מכריע לכם את הבחירות',
    weightsLead: '«לא חשוב» מדלג על המדור כולו. השאר רצים מהפחות חשוב אל החשוב יותר, והאולם מתעדכן אחרי כל אחד. כברירת מחדל כל הנושאים שווים.',
    weights: ['לא חשוב', 'קצת', 'חשוב', 'מכריע'],
    toQuestions: 'אל השאלות',
    questionOf: (current, total) => `שאלה ${current} מתוך ${total}`,
    option: (mark) => `אפשרות ${mark}`,
    marks: ['א', 'ב'],
    answerLabel: 'תשובה',
    choices: ['הראשון', 'נוטה לראשון', 'אמצע', 'נוטה לשני', 'השני'],
    back: 'חזרה',
    skip: 'דילוג',
    next: 'הבא',
    sliderUnset: 'הזיזו את המחוון לאפשרות הקרובה אליכם',
    sliderMid: 'בדיוק באמצע',
    sliderSlight: (side) => `קצת יותר קרוב אל ${side}`,
    sliderClear: (side) => `ברור יותר קרוב אל ${side}`,
    sliderFull: (side) => `לגמרי בעד ${side}`,
    sectionKicker: (current, total) => `מדור ${current} מתוך ${total}`,
    sectionTitle: (name, seats) => `${name} מחלק ${seats} מנדטים`,
    seatsAtStake: (seats) => `${seats} מנדטים על הכף`,
    sectionNext: (name) => `הבא: ${name}`,
    sectionDone: 'הצגת הכנסת שלי',
    sectionMajority: (name) => `${name}: רוב מוחלט`,
    sectionAhead: (name) => `${name} יוצא קדימה`,
    sectionKeeps: (name) => `${name} שומר על ההובלה`,
    sectionTakes: (name) => `${name} לוקח את ההובלה`,
    sectionLeft: (seats) => `עוד ${seats} בהמשך`,
    distributed: (done, total) => `חולקו ${done} מתוך ${total}`,
    majorityMark: 'רוב מוחלט: 61',
    onTheme: 'לפי התשובות במדור הזה',
    wikiTitle: 'תוצאות הבחירות',
    wikiLead: 'כרטיס בעיצוב של תיבת מידע בוויקיפדיה. נוח לשמור אותו כצילום מסך.',
    wikiElection: 'הבחירות לכנסת',
    wikiWhen: '27 באוקטובר 2026',
    wikiByAnswers: 'לפי התשובות במבחן',
    wikiHall: (seats) => `כל ${seats} המנדטים בכנסת`,
    wikiNeed: (seats) => `לרוב צריך ${seats}`,
    wikiConst: (seats) => `רוב חוקתי: ${seats}`,
    wikiLeader: 'מנהיג',
    wikiParty: 'מפלגה',
    wikiWon: 'מנדטים שהתקבלו',
    wikiShare: 'חלק מהמנדטים',
    wikiPolls: 'סקרים',
    wikiOthers: 'השאר',
    wikiSystem: 'שיטה',
    wikiSystemValue: 'אזור אחד, רשימות סגורות',
    wikiBarrier: 'אחוז חסימה',
    wikiCaption: 'חלוקת המנדטים בסוף המבחן',
    wikiNone: 'אין ממשלה עם 61',
    themeShareTitle: 'קולות לפי מדור',
    themeShareLead: 'החלק של כל רשימה בתוך המדור. זה לא ספירת מנדטים שנייה: המנדטים באולם נספרים מכל התשובות יחד.',
    billsTitle: 'מה הכנסת הזאת הייתה מעבירה',
    billsLead: 'הצעת חוק עוברת ב־61 ומעלה. רשימה מצביעה לפי העמדה שלה בשאלה הקרובה. האמצע נמנע.',
    billPass: 'עובר',
    billFail: 'אין 61',
    billYes: 'בעד',
    billNo: 'נגד',
    billHold: 'נמנעים',
    stripsTitle: 'איפה אתם בכל מדור',
    stripsLead: 'העיגול הלבן הוא הממוצע שלכם. הצבעוניים הם הרשימות. פתחו מדור כדי לראות כל שאלה ומי יצא הכי קרוב.',
    byQuestion: (count) => `שאלה אחר שאלה (${count})`,
    closestTag: 'הכי קרוב',
    noOpinion: 'בלי דעה',
    youMark: 'אני',
    keysHint: 'חצים מזיזים את המחוון, \u20661–5\u2069 קופצים לסימונים, Enter ממשיך, \u20660\u2069 מדלג, Backspace חוזר.',
    draft: 'טיוטת כנסת לפי התשובות שכבר ניתנו',
    yourKnesset: 'הכנסת ה־26 שלכם',
    fewAnswers: 'יש מעט תשובות, ולכן החלוקה קרובה יותר לחלוקה שווה מאשר לקמפיין אמיתי.',
    closestBefore: 'הכי קרוב לתשובות שלכם',
    matchWord: 'התאמה',
    whoBuilds: 'מי מגיע ל־61',
    enough: (outside) => `מספיק לרוב${outside ? ' רק עם תמיכה מבחוץ' : ''}`,
    shortBy: (gap) => `חסרים ${gap}`,
    outsidePrefix: 'מבחוץ',
    pmCandidate: (leader) => `מועמד לראשות הממשלה: ${leader}`,
    shortestTitle: 'הממשלות הקצרות ביותר',
    shortestLead: 'הרכבים בלי מפלגה מיותרת: אם מורידים אחת, אין 61. זוגות שסירבו לשבת יחד לא נכנסים.',
    primeWord: 'ראש ממשלה',
    portfolios: 'תיקים',
    portfoliosLead: 'חלוקה גסה לפי איזו רשימה ברוב הזה קרובה יותר לנושא התיק. זה לא הסכם קואליציוני.',
    outlookCaveat: 'תרחיש לפי התשובות שלכם, לא תחזית ל־2030.',
    besidePolls: 'ליד הסקרים',
    besideLead: 'משמאל הכנסת שלכם, מימין ממוצע תחזיות המנדטים מתחילת אוקטובר 2026.',
    colList: 'רשימה',
    colYou: 'אתם',
    colPolls: 'סקרים',
    belowWord: 'חסימה',
    belowLine: (list) => `מתחת לאחוז החסימה 3.25%: ${list}.`,
    whereTitle: 'איפה אתם עומדים',
    whereLead: 'הציר האופקי: מכוח ושטח אל עסקה. הציר האנכי: מהרבנות ושלטון הרוב אל בית המשפט וכללים חילוניים. נקודת «אני» מחושבת מאותן שאלות.',
    copy: 'העתקת התוצאה',
    copied: 'הועתק',
    editAnswers: 'עריכת תשובות',
    restart: 'מההתחלה',
    disclaimer: 'עמדות הרשימות הן הערכת מערכת לפי הצהרות פומביות בסתיו 2026. הכנסת פוזרה ב־17 ביולי 2026, וההצבעה נקבעה ל־27 באוקטובר. המיזם אינו קשור לוועדת הבחירות המרכזית ואינו תעמולת בחירות.',
    shareText: (lines, verdict) => `הכנסת שלי 2026: ${lines}. ${verdict}`,
    compassAria: 'קואורדינטות פוליטיות',
    compassTop: 'מוסדות חילוניים',
    compassBottom: 'הרבנות ושלטון הרוב',
    compassLeft: 'כוח ושטח',
    compassRight: 'עסקה ואזרחות',
    compassYou: 'אני',
  },
}

export type I18nValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: Ui
}

const defaultI18n: I18nValue = {
  locale: 'ru',
  setLocale: () => {},
  t: ui.ru,
}

export const I18nContext = createContext<I18nValue>(defaultI18n)

export function useI18n() {
  return useContext(I18nContext)
}

export const partyIds = parties.map((party) => party.id)
