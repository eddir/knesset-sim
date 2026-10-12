import { Hemicycle } from '@/components/Hemicycle'
import { MAJORITY, SEAT_COUNT, parties } from '@/data'
import { groupsFrom } from '@/hemicycle'
import { partyName, useI18n } from '@/i18n'

function leaderId(seats: Record<string, number>) {
  return parties.slice().sort((a, b) => (seats[b.id] ?? 0) - (seats[a.id] ?? 0) || b.poll - a.poll)[0].id
}

export function SectionBoard({
  name,
  awarded,
  sectionIndex,
  sectionTotal,
  prev,
  now,
  nextLabel,
  onNext,
  onBack,
}: {
  name: string
  awarded: number
  sectionIndex: number
  sectionTotal: number
  prev: Record<string, number>
  now: Record<string, number>
  nextLabel: string
  onNext: () => void
  onBack: () => void
}) {
  const { t, locale } = useI18n()
  const lead = leaderId(now)
  const previous = leaderId(prev)
  const filled = Object.values(now).reduce((sum, value) => sum + value, 0)
  const leadName = partyName(locale, lead)
  let message = now[lead] >= MAJORITY
    ? t.sectionMajority(leadName)
    : sectionIndex === 0
      ? t.sectionAhead(leadName)
      : previous !== lead && (prev[previous] ?? 0) > 0
        ? t.sectionTakes(leadName)
        : t.sectionKeeps(leadName)
  if (filled < SEAT_COUNT) message = `${message} · ${t.sectionLeft(SEAT_COUNT - filled)}`
  const ranked = parties.slice().sort((a, b) => (now[b.id] ?? 0) - (now[a.id] ?? 0) || b.poll - a.poll)
  const groups = groupsFrom(now).map((group) => ({ ...group, name: partyName(locale, group.id) }))

  return (
    <section className="narrow">
      <div className="rounded-2xl border bg-card p-4 sm:p-5">
        <p className="text-[11px] font-bold tracking-[0.12em] text-muted-foreground uppercase">{t.sectionKicker(sectionIndex + 1, sectionTotal)}</p>
        <h1 className="font-heading mt-2 text-2xl font-semibold sm:text-3xl">{t.sectionTitle(name, awarded)}</h1>
        <div className="mt-4 grid items-center gap-6 lg:grid-cols-2">
          <Hemicycle groups={groups} label={String(filled)} sub={t.hemicycleSub} />
          <div>
            <ol className="space-y-1">
              {ranked.map((party, index) => {
                const seats = now[party.id] ?? 0
                const delta = seats - (prev[party.id] ?? 0)
                return (
                  <li key={party.id} className={`board-row${seats >= MAJORITY ? ' maj' : ''}`} style={{ ['--c' as string]: party.color }}>
                    <span className="text-center text-sm font-extrabold text-muted-foreground">{index + 1}</span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{partyName(locale, party.id)}</span>
                      <span className="bar"><span style={{ width: `${Math.min(100, (seats / (MAJORITY / 0.7)) * 100)}%` }} /></span>
                    </span>
                    <span className={`delta${delta > 0 ? '' : delta < 0 ? ' neg' : ' zero'}`}>{delta > 0 ? `+${delta}` : delta < 0 ? `−${-delta}` : '0'}</span>
                    <span className="font-heading text-right text-lg tabular-nums">{seats}</span>
                  </li>
                )
              })}
            </ol>
            <p className="mt-3 text-center text-sm font-bold" aria-live="polite">{message}</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
          <span>{t.majorityMark}</span>
          <span>{t.distributed(filled, SEAT_COUNT)} · {t.onTheme}</span>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <button type="button" className="quiet" onClick={onBack}>{t.back}</button>
        <button type="button" className="cta" autoFocus onClick={onNext}>{nextLabel}</button>
      </div>
    </section>
  )
}
