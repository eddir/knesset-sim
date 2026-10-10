import { createContext, useContext } from 'react'
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

type PartyBits = { name: string; leader: string }
type QuestionBits = { title: string; a: string; b: string }
type ThemeBits = { name: string; hint: string }

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

const enQuestions: Record<string, QuestionBits> = {
  gaza: {
    title: 'The war in Gaza',
    a: "Keep going until Hamas's military wing is dismantled",
    b: 'Stop the war for a deal and a civilian administration without Hamas',
  },
  hostages: {
    title: 'The hostages',
    a: 'Military pressure first, even if a swap is delayed',
    b: 'A release deal matters more than continuing the operation',
  },
  iran: {
    title: 'Iran',
    a: 'Israel may strike the nuclear program even without the United States',
    b: 'Only with Washington, and only after diplomacy is exhausted',
  },
  settlements: {
    title: 'Settlements',
    a: 'Build and legally entrench settlements in Judea and Samaria',
    b: 'Freeze the expansion of settlements',
  },
  twostate: {
    title: 'A Palestinian state',
    a: 'There will not be one: no second state west of the Jordan',
    b: 'Two states remain the horizon if there is a security partner',
  },
  after: {
    title: 'Gaza after Hamas',
    a: 'Israeli security control for years, with no Palestinian administration',
    b: 'Civilian rule by Arab states or a reformed Palestinian administration',
  },
  annex: {
    title: 'Sovereignty',
    a: 'Extend Israeli sovereignty to Judea and Samaria',
    b: 'Do not annex a territory where millions of Palestinians have no citizenship',
  },
  court: {
    title: 'The Supreme Court',
    a: 'An override clause: the Knesset may cancel a court ruling',
    b: 'The court remains a check on majority power',
  },
  pm: {
    title: 'Who forms the government',
    a: 'Benjamin Netanyahu should assemble the next cabinet',
    b: 'After October 7 the prime minister should be someone else',
  },
  inquiry: {
    title: 'The October 7 commission',
    a: 'An internal army review is enough. No state commission is needed',
    b: 'An independent state commission with real powers is needed',
  },
  draft: {
    title: 'Drafting Haredim',
    a: 'Yeshiva students still do not join the army',
    b: 'Service, or the loss of benefits and yeshiva funding',
  },
  shabbat: {
    title: 'The rabbinate and Shabbat',
    a: 'Marriage, kashrut and Shabbat stay with the Chief Rabbinate',
    b: 'Civil marriage and public transport on Shabbat',
  },
  yeshiva: {
    title: 'Yeshiva money',
    a: 'Keep yeshiva budgets and child allowances for large Haredi families',
    b: 'Tie transfers to work and to a secular core in school',
  },
  prices: {
    title: 'Prices',
    a: 'Cut taxes and regulation, even if support for the poor shrinks',
    b: 'Subsidies, price controls and a thicker social budget',
  },
  budget: {
    title: 'The budget after the war',
    a: 'Military spending comes first. The deficit can grow',
    b: 'Put money back into housing, hospitals and schools',
  },
  housing: {
    title: 'Housing',
    a: 'The market will bring prices down: faster permits and less rent control',
    b: 'A rent cap and a large stock of public housing',
  },
  arab: {
    title: 'Arab parties in the cabinet',
    a: 'A government made only of Zionist lists',
    b: 'Arab parties can be coalition partners',
  },
  nation: {
    title: 'The Nation-State Law',
    a: 'Keep it strict: Israel is first the state of the Jewish people',
    b: 'Soften it so Arab citizens have equal status',
  },
}

const heQuestions: Record<string, QuestionBits> = {
  gaza: {
    title: 'המלחמה בעזה',
    a: 'להמשיך עד לפירוק הזרוע הצבאית של חמאס',
    b: 'לעצור את המלחמה תמורת עסקה וממשל אזרחי בלי חמאס',
  },
  hostages: {
    title: 'החטופים',
    a: 'קודם לחץ צבאי, גם אם עסקת החזרה מתעכבת',
    b: 'עסקת שחרור חשובה יותר מהמשך המבצע',
  },
  iran: {
    title: 'איראן',
    a: 'ישראל רשאית לתקוף את תוכנית הגרעין גם בלי ארה״ב',
    b: 'רק יחד עם וושינגטון, ואחרי שמיצו את הדיפלומטיה',
  },
  settlements: {
    title: 'התנחלויות',
    a: 'לבנות ולעגן בחוק התנחלויות ביהודה ושומרון',
    b: 'להקפיא את הרחבת ההתנחלויות',
  },
  twostate: {
    title: 'מדינה פלסטינית',
    a: 'לא תהיה: אין מדינה שנייה ממערב לירדן',
    b: 'שתי מדינות נשארות האופק, אם יהיה שותף ביטחוני',
  },
  after: {
    title: 'עזה אחרי חמאס',
    a: 'שליטה ביטחונית ישראלית לשנים, בלי ממשל פלסטיני',
    b: 'שלטון אזרחי של מדינות ערב או של רשות פלסטינית מחודשת',
  },
  annex: {
    title: 'ריבונות',
    a: 'להחיל את ריבונות ישראל על יהודה ושומרון',
    b: 'לא לספח שטח שבו מיליוני פלסטינים בלי אזרחות',
  },
  court: {
    title: 'בית המשפט העליון',
    a: 'פסקת התגברות: הכנסת יכולה לבטל פסיקה',
    b: 'בית המשפט נשאר בלם על שלטון הרוב',
  },
  pm: {
    title: 'מי מרכיב את הממשלה',
    a: 'את הממשלה הבאה צריך להרכיב בנימין נתניהו',
    b: 'אחרי 7 באוקטובר ראש הממשלה צריך להיות מישהו אחר',
  },
  inquiry: {
    title: 'ועדת חקירה ל־7 באוקטובר',
    a: 'די בבדיקה פנימית של הצבא, בלי ועדת חקירה ממלכתית',
    b: 'צריך ועדת חקירה ממלכתית עצמאית עם סמכויות',
  },
  draft: {
    title: 'גיוס חרדים',
    a: 'תלמידי ישיבות עדיין לא הולכים לצבא',
    b: 'שירות, או אובדן הטבות ותקציב הישיבות',
  },
  shabbat: {
    title: 'הרבנות ושבת',
    a: 'נישואים, כשרות ושבת נשארים אצל הרבנות הראשית',
    b: 'נישואים אזרחיים ותחבורה ציבורית בשבת',
  },
  yeshiva: {
    title: 'כסף לישיבות',
    a: 'לשמור על תקציבי הישיבות וקצבאות למשפחות חרדיות ברוכות ילדים',
    b: 'לקשור העברות לעבודה ולליבה חילונית בבית הספר',
  },
  prices: {
    title: 'מחירים',
    a: 'להוריד מסים ורגולציה, גם אם התמיכה בעניים תצטמצם',
    b: 'סובסידיות, פיקוח מחירים ותקציב חברתי עבה יותר',
  },
  budget: {
    title: 'התקציב אחרי המלחמה',
    a: 'ההוצאה הצבאית קודמת, אפשר להגדיל את הגירעון',
    b: 'להחזיר כסף לדיור, לבתי חולים ולבתי ספר',
  },
  housing: {
    title: 'דיור',
    a: 'השוק יוריד מחירים: היתרים מהר יותר ופחות פיקוח על שכירות',
    b: 'תקרת שכירות ומלאי גדול של דיור ציבורי',
  },
  arab: {
    title: 'מפלגות ערביות בממשלה',
    a: 'ממשלה רק מרשימות ציוניות',
    b: 'מפלגות ערביות יכולות להיות שותפות קואליציה',
  },
  nation: {
    title: 'חוק הלאום',
    a: 'להשאיר אותו נוקשה: ישראל היא קודם מדינת העם היהודי',
    b: 'לרכך אותו למען מעמד שווה לאזרחים הערבים',
  },
}

const enThemes: Record<string, ThemeBits> = {
  security: { name: 'War and deterrence', hint: 'Gaza, the hostages, Iran' },
  land: { name: 'Territory', hint: 'Settlements, Gaza after the war, annexation' },
  power: { name: 'Power and the court', hint: 'Netanyahu, the Supreme Court, a commission' },
  faith: { name: 'Religion and the draft', hint: 'Haredim, Shabbat, yeshiva budgets' },
  money: { name: 'Money', hint: 'Prices, housing, the war budget' },
  citizens: { name: 'Citizens', hint: 'Arab parties and the Nation-State Law' },
}

const heThemes: Record<string, ThemeBits> = {
  security: { name: 'מלחמה והרתעה', hint: 'עזה, חטופים, איראן' },
  land: { name: 'שטח', hint: 'התנחלויות, עזה אחרי המלחמה, סיפוח' },
  power: { name: 'שלטון ובית המשפט', hint: 'נתניהו, בג״ץ, ועדת חקירה' },
  faith: { name: 'דת וגיוס', hint: 'חרדים, שבת, תקציבי ישיבות' },
  money: { name: 'הכיס', hint: 'מחירים, דיור, תקציב הביטחון' },
  citizens: { name: 'אזרחים', hint: 'מפלגות ערביות וחוק הלאום' },
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
  const fallback = { title: source?.title ?? id, a: source?.a ?? '', b: source?.b ?? '' }
  if (locale === 'en') return enQuestions[id] ?? fallback
  if (locale === 'he') return heQuestions[id] ?? fallback
  return fallback
}

export function themeText(locale: Locale, id: string): ThemeBits {
  const source = themes.find((item) => item.id === id)
  const fallback = { name: source?.name ?? id, hint: source?.hint ?? '' }
  if (locale === 'en') return enThemes[id] ?? fallback
  if (locale === 'he') return heThemes[id] ?? fallback
  return fallback
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
  introLead: string
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
      'Цифры опросов на первом экране - округлённое среднее опубликованных мандатных прогнозов начала октября 2026 года. «Народ Израиля» Офера Винтера в этом среднем ниже барьера.',
    ],
    close: 'Закрыть',
    lightTheme: 'Светлая тема',
    darkTheme: 'Тёмная тема',
    language: 'Язык',
    date: '27 октября 2026',
    introTitle: 'Соберите Кнессет своими ответами',
    introLead: 'Восемнадцать вопросов про Газу, суд, призыв харедим и то, кто должен быть премьером. На выходе 120 мандатов, барьер 3,25% и проверка, собирается ли кабинет на 61 место.',
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
    weightsLead: 'Тема с весом «не важно» не влияет на мандаты. По умолчанию все шесть одинаково важны.',
    weights: ['Не важно', 'Слабо', 'Важно', 'Решающе'],
    toQuestions: 'К вопросам',
    questionOf: (current, total) => `Вопрос ${current} из ${total}`,
    option: (mark) => `Вариант ${mark}`,
    marks: ['А', 'Б'],
    answerLabel: 'Ответ',
    choices: ['Первый', 'Скорее первый', 'Середина', 'Скорее второй', 'Второй'],
    back: 'Назад',
    skip: 'Пропустить',
    keysHint: 'Клавиши 1–5, 0 пропуск, Backspace назад.',
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
      'The polling figures on the first screen are a rounded average of published seat forecasts from early October 2026. Ofer Winter’s Am Yisrael is under the threshold in that average.',
    ],
    close: 'Close',
    lightTheme: 'Light theme',
    darkTheme: 'Dark theme',
    language: 'Language',
    date: '27 October 2026',
    introTitle: 'Build the Knesset with your answers',
    introLead: 'Eighteen questions on Gaza, the court, drafting Haredim, and who should be prime minister. You get 120 seats, a 3.25% threshold, and a check on whether a cabinet reaches 61.',
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
    weightsLead: 'A theme set to “not important” does not move seats. By default all six weigh the same.',
    weights: ['Not important', 'A little', 'Important', 'Decisive'],
    toQuestions: 'To the questions',
    questionOf: (current, total) => `Question ${current} of ${total}`,
    option: (mark) => `Option ${mark}`,
    marks: ['A', 'B'],
    answerLabel: 'Answer',
    choices: ['First', 'Leaning first', 'Middle', 'Leaning second', 'Second'],
    back: 'Back',
    skip: 'Skip',
    keysHint: 'Keys 1–5, 0 to skip, Backspace to go back.',
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
      'מספרי הסקרים במסך הראשון הם ממוצע מעוגל של תחזיות מנדטים שפורסמו בתחילת אוקטובר 2026. «עם ישראל» של עופר וינטר נמצא בממוצע הזה מתחת לאחוז החסימה.',
    ],
    close: 'סגירה',
    lightTheme: 'ערכת בהירה',
    darkTheme: 'ערכת כהה',
    language: 'שפה',
    date: '27 באוקטובר 2026',
    introTitle: 'בנו את הכנסת מהתשובות שלכם',
    introLead: 'שמונה־עשרה שאלות על עזה, בית המשפט, גיוס חרדים ומי צריך להיות ראש הממשלה. בסוף 120 מנדטים, אחוז חסימה של 3.25%, ובדיקה אם יש ממשלה עם 61.',
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
    weightsLead: 'נושא במשקל «לא חשוב» לא מזיז מנדטים. כברירת מחדל כל ששת הנושאים שווים.',
    weights: ['לא חשוב', 'קצת', 'חשוב', 'מכריע'],
    toQuestions: 'אל השאלות',
    questionOf: (current, total) => `שאלה ${current} מתוך ${total}`,
    option: (mark) => `אפשרות ${mark}`,
    marks: ['א', 'ב'],
    answerLabel: 'תשובה',
    choices: ['הראשון', 'נוטה לראשון', 'אמצע', 'נוטה לשני', 'השני'],
    back: 'חזרה',
    skip: 'דילוג',
    keysHint: 'מקשים \u20661–5\u2069, \u20660\u2069 לדילוג, Backspace לחזרה.',
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
