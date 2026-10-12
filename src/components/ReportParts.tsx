import { Fragment, useState, type ReactNode } from 'react'
import { MAJORITY, SEAT_COUNT, parties, questions, themes, weightLevels } from '@/data'
import { Hemicycle } from '@/components/Hemicycle'
import { groupsFrom } from '@/hemicycle'
import { bills } from '@/bills'
import { billText, partyLeader, partyName, postName, themeText, useI18n, questionText } from '@/i18n'
import { billTallies, cabinetOf, formatPct, nearestParty, themeAxis, themeShares, userBillLean, vetoClash, type Answers, type SeatResult, type Weights } from '@/model'

function initials(name: string) {
  const words = name.split(/\s+/).filter(Boolean)
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return words.map((word) => word[0]).join('').slice(0, 3).toUpperCase()
}

export function WikiCard({ result }: { result: SeatResult }) {
  const { t, locale } = useI18n()
  const ranked = parties.filter((party) => result.seats[party.id] > 0).slice().sort((a, b) => result.seats[b.id] - result.seats[a.id] || b.poll - a.poll)
  const top = ranked.slice(0, 6)
  const rest = ranked.slice(6)
  const columns: typeof top[] = []
  for (let index = 0; index < top.length; index += 3) columns.push(top.slice(index, index + 3))
  const primary = result.scenarios.find((item) => item.id === result.primaryId)
  const pm = primary && primary.total >= MAJORITY && primary.outside.length === 0 && primary.pm
    ? `${partyLeader(locale, primary.pm)} (${partyName(locale, primary.pm)})`
    : t.wikiNone
  const groups = groupsFrom(result.seats).map((group) => ({ ...group, name: partyName(locale, group.id) }))
  const barrier = locale === 'en' ? '3.25%' : '3,25%'
  const constitutional = Math.ceil(SEAT_COUNT * 2 / 3)
  return (
    <section className="rounded-2xl border bg-card p-3 sm:p-5">
      <h2 className="font-heading text-2xl font-semibold">{t.wikiTitle}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{t.wikiLead}</p>
      <div className="mt-4 overflow-x-auto" dir="ltr">
        <table className="wb">
          <tbody>
            <tr>
              <th className="wb-title" colSpan={4}>
                {t.wikiElection}
                <div>{t.wikiWhen}</div>
                <div>{t.wikiByAnswers}</div>
              </th>
            </tr>
            <tr>
              <td className="wb-sub" colSpan={4}>
                <div>{t.wikiHall(SEAT_COUNT)}</div>
                <div>{t.wikiNeed(MAJORITY)}</div>
                <div>{t.wikiConst(constitutional)}</div>
                <div>{t.wikiBarrier}: {barrier}</div>
                <div>{pm}</div>
              </td>
            </tr>
            {columns.map((group) => {
              const blanks = 3 - group.length
              const row = (label: string, render: (party: (typeof group)[number]) => ReactNode) => (
                <tr>
                  <th scope="row">{label}</th>
                  {group.map((party) => <td key={party.id}>{render(party)}</td>)}
                  {Array.from({ length: blanks }, (_, index) => <td key={`${label}-pad-${index}`} />)}
                </tr>
              )
              return (
                <Fragment key={group.map((party) => party.id).join('-')}>
                  {row('', (party) => (
                    <div className="wb-ph" style={{ background: party.color }}><span>{initials(partyName(locale, party.id))}</span></div>
                  ))}
                  {row(t.wikiLeader, (party) => partyLeader(locale, party.id))}
                  {row(t.wikiParty, (party) => <span className="wb-pn"><i style={{ background: party.color }} />{partyName(locale, party.id)}</span>)}
                  {row(t.wikiWon, (party) => <b>{result.seats[party.id]}</b>)}
                  {row(t.wikiShare, (party) => `${formatPct(result.seats[party.id] / SEAT_COUNT, locale)}%`)}
                  {row(t.wikiPolls, (party) => party.poll || t.belowWord)}
                  <tr><td className="wb-hr" colSpan={4} /></tr>
                </Fragment>
              )
            })}
            <tr>
              <td colSpan={4}>
                <div className="hemi"><Hemicycle groups={groups} label="120" sub={t.hemicycleSub} /></div>
                <div className="wb-cap">{t.wikiCaption}</div>
              </td>
            </tr>
            {rest.length > 0 && (
              <tr>
                <th scope="row">{t.wikiOthers}</th>
                <td className="wb-left" colSpan={3}>{rest.map((party) => `${partyName(locale, party.id)} ${result.seats[party.id]}`).join(', ')}</td>
              </tr>
            )}
            <tr>
              <th scope="row">{t.wikiSystem}</th>
              <td className="wb-left" colSpan={3}>{t.wikiSystemValue}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  )
}

function SideLine({ label, ids }: { label: string; ids: string[] }) {
  const { locale } = useI18n()
  if (!ids.length) return null
  return (
    <p className="text-xs leading-relaxed text-muted-foreground">
      <b className="text-foreground capitalize">{label}: </b>
      {ids.map((id) => (
        <span key={id} className="me-2 inline-flex items-center">
          <i className="me-1 inline-block size-2 rounded-full" style={{ background: parties.find((party) => party.id === id)?.color }} />
          {partyName(locale, id)}
        </span>
      ))}
    </p>
  )
}

export function BillList({ seats, answers }: { seats: Record<string, number>; answers: Answers }) {
  const { t, locale } = useI18n()
  const rows = billTallies(seats)
  return (
    <section>
      <h2 className="font-heading text-2xl font-semibold">{t.billsTitle}</h2>
      <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{t.billsLead}</p>
      <div className="mt-4 space-y-3">
        {rows.map((row) => {
          const copy = billText(locale, row.id)
          const total = Math.max(1, row.yes + row.no + row.abstain)
          const bill = bills.find((item) => item.id === row.id)
          const lean = bill ? userBillLean(bill.questionId, bill.side, answers) : null
          return (
            <article key={row.id} className="rounded-xl border bg-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-medium">{copy.title}</h3>
                <span className="pill" style={{ borderColor: row.passed ? 'var(--up)' : 'var(--down)', color: row.passed ? 'var(--up)' : 'var(--down)' }}>{row.passed ? t.billPass : t.billFail}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{copy.body}</p>
              <div className="vbar mt-3" aria-hidden="true">
                <i style={{ width: `${(row.yes / total) * 100}%`, background: 'var(--up)' }} />
                <i style={{ width: `${(row.abstain / total) * 100}%`, background: 'var(--ink3)' }} />
                <i style={{ width: `${(row.no / total) * 100}%`, background: 'var(--down)' }} />
                <em style={{ left: `${(MAJORITY / SEAT_COUNT) * 100}%` }} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground tabular-nums">
                {row.yes} {t.billYes} · {row.no} {t.billNo} · {row.abstain} {t.billHold}
              </p>
              <div className="mt-2 space-y-1">
                <p className="text-xs font-semibold text-muted-foreground">{t.billSides}</p>
                <SideLine label={t.billYes} ids={row.yesIds} />
                <SideLine label={t.billHold} ids={row.holdIds} />
                <SideLine label={t.billNo} ids={row.noIds} />
              </div>
              {lean && <p className="mt-2 text-sm">{t.billYou(lean)}</p>}
            </article>
          )
        })}
      </div>
    </section>
  )
}

export function ThemeShareList({
  answers,
  weights,
  onWeight,
}: {
  answers: Answers
  weights: Weights
  onWeight: (themeId: string, level: number) => void
}) {
  const { t, locale } = useI18n()
  const rows = themeShares(answers, weights).filter((row) => row.answered > 0)
  return (
    <section>
      <h2 className="font-heading text-2xl font-semibold">{t.themeShareTitle}</h2>
      <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{t.themeShareLead}</p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {rows.map((row) => {
          const theme = themeText(locale, row.themeId)
          const source = themes.find((item) => item.id === row.themeId)
          const parts = parties.filter((party) => row.shares[party.id] > 0.02).slice().sort((a, b) => row.shares[b.id] - row.shares[a.id])
          return (
            <article key={row.themeId} className="rounded-xl border bg-card p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-medium"><i className="me-2 inline-block size-2.5 rounded-full" style={{ background: source?.color }} />{theme.name}</h3>
                <span className="text-sm text-muted-foreground">{row.answered}</span>
              </div>
              <div className="vbar mt-3">
                {parts.map((party) => (
                  <i key={party.id} title={`${partyName(locale, party.id)} ${formatPct(row.shares[party.id], locale)}%`} style={{ width: `${row.shares[party.id] * 100}%`, background: party.color }} />
                ))}
              </div>
              <div className="seg mt-3" role="radiogroup" aria-label={theme.name}>
                {weightLevels.map((level) => (
                  <button key={level.id} type="button" role="radio" aria-checked={weights[row.themeId] === level.id} onClick={() => onWeight(row.themeId, level.id)}>
                    {t.weights[level.id]}
                  </button>
                ))}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export function ThemeStrips({ answers }: { answers: Answers }) {
  const { t, locale } = useI18n()
  const [open, setOpen] = useState<string | null>(null)
  const rows = themes.map((theme) => ({ theme, axis: themeAxis(theme.id, answers) })).filter((row) => row.axis.answered > 0)
  return (
    <section>
      <h2 className="font-heading text-2xl font-semibold">{t.stripsTitle}</h2>
      <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{t.stripsLead}</p>
      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
        {parties.map((party) => (
          <span key={party.id}><i className="me-1 inline-block size-2 rounded-full" style={{ background: party.color }} />{partyName(locale, party.id)}</span>
        ))}
        <span><i className="me-1 inline-block size-2 rounded-full border-2 border-foreground bg-card" />{t.youMark}</span>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {rows.map(({ theme, axis }) => {
          const copy = themeText(locale, theme.id)
          const x = (value: number) => 12 + ((value + 1) / 2) * (300 - 24)
          const asked = questions.filter((question) => question.theme === theme.id && question.id in answers)
          return (
            <article key={theme.id} className="strip-line">
              <div className="flex justify-between gap-2 text-[11px] text-muted-foreground">
                <span>{copy.lo}</span>
                <b className="text-center text-foreground">{copy.name}</b>
                <span className="text-end">{copy.hi}</span>
              </div>
              <svg viewBox="0 0 300 26" width="100%" aria-hidden="true">
                <rect x="12" y="10" width="276" height="6" rx="3" fill="var(--input)" />
                {parties.map((party) => (
                  <circle key={party.id} cx={x(axis.positions[party.id] ?? 0)} cy="13" r="5" fill={party.color}>
                    <title>{partyName(locale, party.id)}</title>
                  </circle>
                ))}
                {axis.user !== null && <circle cx={x(axis.user)} cy="13" r="7" fill="var(--card)" stroke="var(--foreground)" strokeWidth="2.5" />}
              </svg>
              <button type="button" className="quiet" aria-expanded={open === theme.id} onClick={() => setOpen(open === theme.id ? null : theme.id)}>
                {t.byQuestion(asked.length)}
              </button>
              {open === theme.id && (
                <ul className="mt-1 space-y-2">
                  {asked.map((question) => {
                    const value = answers[question.id]
                    const copyQ = questionText(locale, question.id)
                    const near = typeof value === 'number' ? nearestParty(question, value) : null
                    const x = (point: number) => 12 + ((point + 1) / 2) * (300 - 24)
                    return (
                      <li key={question.id} className="border-t pt-2 text-sm">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-medium">{copyQ.title}</span>
                          {near
                            ? <span className="pill"><i className="me-1 inline-block size-2 rounded-full" style={{ background: parties.find((party) => party.id === near)?.color }} />{t.closestTag}: {partyName(locale, near)}</span>
                            : <span className="text-xs text-muted-foreground">{t.noOpinion}</span>}
                        </div>
                        <svg viewBox="0 0 300 22" width="100%" aria-hidden="true">
                          <rect x="12" y="9" width="276" height="4" rx="2" fill="var(--pend)" />
                          <line x1="150" y1="4" x2="150" y2="18" stroke="var(--ink3)" strokeWidth="1" />
                          {parties.filter((party) => party.id !== near).map((party) => (
                            <circle key={party.id} cx={x(question.stance[party.id] ?? 0)} cy="11" r="3.5" fill={party.color} opacity={near ? 0.4 : 0.85} />
                          ))}
                          {near && (
                            <circle cx={x(question.stance[near] ?? 0)} cy="11" r="6" fill={parties.find((party) => party.id === near)?.color} stroke="var(--card)" strokeWidth="2" />
                          )}
                          {typeof value === 'number' && <circle cx={x(value)} cy="11" r="5.5" fill="var(--card)" stroke="var(--foreground)" strokeWidth="2" />}
                        </svg>
                        <p className="flex justify-between gap-3 text-[11px] text-muted-foreground"><span>{copyQ.a}</span><span className="text-end">{copyQ.b}</span></p>
                      </li>
                    )
                  })}
                </ul>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}

export function OwnCoalition({ seats }: { seats: Record<string, number> }) {
  const { t, locale } = useI18n()
  const [picked, setPicked] = useState<string[]>([])
  const present = parties.filter((party) => (seats[party.id] ?? 0) > 0)
  const total = picked.reduce((sum, id) => sum + (seats[id] ?? 0), 0)
  const clash = vetoClash(picked)
  const cabinet = cabinetOf(picked, seats)
  const constitutional = Math.ceil(SEAT_COUNT * 2 / 3)
  return (
    <section>
      <h2 className="font-heading text-2xl font-semibold">{t.ownCoalition}</h2>
      <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{t.ownCoalitionLead}</p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {present.map((party) => {
          const on = picked.includes(party.id)
          return (
            <button
              key={party.id}
              type="button"
              aria-pressed={on}
              onClick={() => setPicked((current) => on ? current.filter((id) => id !== party.id) : [...current, party.id])}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${on ? 'border-primary bg-primary text-primary-foreground' : 'bg-card text-muted-foreground'}`}
            >
              <i className="size-2 rounded-full" style={{ background: on ? 'currentColor' : party.color }} />
              {partyName(locale, party.id)} {seats[party.id]}
            </button>
          )
        })}
      </div>
      <p className="mt-3 text-sm" aria-live="polite">
        {picked.length === 0 && t.ownEmpty}
        {picked.length > 0 && <b className="tabular-nums">{t.ownSeats(total, SEAT_COUNT)}. </b>}
        {picked.length > 0 && clash && t.ownVeto(partyName(locale, clash[0]), partyName(locale, clash[1]))}
        {picked.length > 0 && !clash && total >= constitutional && t.ownConst}
        {picked.length > 0 && !clash && total >= MAJORITY && total < constitutional && t.ownMajority}
        {picked.length > 0 && !clash && total < MAJORITY && t.ownShort(MAJORITY - total)}
      </p>
      {cabinet && (
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {cabinet.map((seat) => (
            <li key={seat.post} className="flex items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3">
              <span>{postName(locale, seat.post)}</span>
              <span className="text-end font-medium">{partyName(locale, seat.partyId)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
