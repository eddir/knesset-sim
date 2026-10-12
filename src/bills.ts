import type { Text3 } from './questions'

export type Bill = {
  id: string
  questionId: string
  /** -1: законопроект это вариант А. +1: вариант Б. */
  side: -1 | 1
  title: Text3
  body: Text3
}

function text(ru: string, en: string, he: string): Text3 {
  return { ru, en, he }
}

export const bills: Bill[] = [
  {
    id: 'override',
    questionId: 'court',
    side: -1,
    title: text('Оговорка преодоления', 'Override clause', 'פסקת התגברות'),
    body: text(
      'Кнессет простым большинством отменяет решение Верховного суда.',
      'The Knesset cancels a Supreme Court ruling by a simple majority.',
      'הכנסת מבטלת פסיקה של בית המשפט העליון ברוב רגיל.',
    ),
  },
  {
    id: 'draftlaw',
    questionId: 'draft',
    side: 1,
    title: text('Закон о призыве', 'The draft law', 'חוק הגיוס'),
    body: text(
      'Ученики ешив идут служить, иначе ешива теряет бюджет и льготы.',
      'Yeshiva students serve, or the yeshiva loses its budget and benefits.',
      'תלמידי ישיבה מתגייסים, אחרת הישיבה מאבדת תקציב והטבות.',
    ),
  },
  {
    id: 'sovereignty',
    questionId: 'annex',
    side: -1,
    title: text('Суверенитет над Иудеей и Самарией', 'Sovereignty in Judea and Samaria', 'ריבונות ביהודה ושומרון'),
    body: text(
      'Израильское право распространяется на Иудею и Самарию.',
      'Israeli law extends to Judea and Samaria.',
      'הדין הישראלי חל על יהודה ושומרון.',
    ),
  },
  {
    id: 'deal',
    questionId: 'hostages',
    side: 1,
    title: text('Сделка по заложникам', 'A hostage deal', 'עסקת חטופים'),
    body: text(
      'Пауза в операции в обмен на освобождение заложников.',
      'A pause in the operation in exchange for the hostages.',
      'הפוגה במבצע תמורת שחרור החטופים.',
    ),
  },
  {
    id: 'commission',
    questionId: 'inquiry',
    side: 1,
    title: text('Государственная комиссия 7 октября', 'A state commission on October 7', 'ועדת חקירה ממלכתית ל־7 באוקטובר'),
    body: text(
      'Независимая комиссия с полномочиями вызывать свидетелей.',
      'An independent commission with the power to call witnesses.',
      'ועדה עצמאית עם סמכות לזמן עדים.',
    ),
  },
  {
    id: 'civil',
    questionId: 'shabbat',
    side: 1,
    title: text('Гражданский брак', 'Civil marriage', 'נישואים אזרחיים'),
    body: text(
      'Брак регистрирует государство, а не только раввинат.',
      'The state registers marriage, not only the rabbinate.',
      'המדינה רושמת נישואים, לא רק הרבנות.',
    ),
  },
  {
    id: 'rent',
    questionId: 'housing',
    side: 1,
    title: text('Потолок аренды', 'A rent cap', 'תקרת שכירות'),
    body: text(
      'Потолок роста аренды и программа общественного жилья.',
      'A cap on rent increases and a public-housing program.',
      'תקרה להעלאת שכר דירה ותוכנית לדיור ציבורי.',
    ),
  },
  {
    id: 'nationbill',
    questionId: 'nation',
    side: -1,
    title: text('Закон о национальном государстве без поправок', 'The Nation-State Law, unamended', 'חוק הלאום בלי תיקון'),
    body: text(
      'Закон остаётся жёстким: еврейское государство первично.',
      'The law stays strict: the Jewish state comes first.',
      'החוק נשאר נוקשה: מדינת הלאום היהודי קודמת.',
    ),
  },
]
