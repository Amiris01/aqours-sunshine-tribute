import { timeline, type Milestone } from '../../content/timeline'
import { pick } from '../../content/types'
import { SectionHeading } from '../../lib/SectionHeading'
import { useLang } from '../../store/lang'

function byYear(items: Milestone[]) {
  const groups = new Map<string, Milestone[]>()
  for (const m of items) {
    const y = m.date.slice(0, 4)
    groups.set(y, [...(groups.get(y) ?? []), m])
  }
  return [...groups]
}

/** Read like the dates on the back of a tour shirt: big years, then what happened. */
export function Journey() {
  const lang = useLang((s) => s.lang)
  return (
    <section id="journey" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-28">
      <SectionHeading title="journey.h2" />
      <div className="mt-12 space-y-10">
        {byYear(timeline).map(([year, items]) => (
          <div key={year} className="grid gap-3 md:grid-cols-[11rem_1fr] md:gap-8">
            <h3 className="font-led text-4xl leading-none text-haze md:text-5xl">{year}</h3>
            <ol className="space-y-3 md:pt-1.5">
              {items.map((m) => (
                <li
                  key={m.date + m.text.en}
                  data-live={m.live ? 'true' : 'false'}
                  className={`grid grid-cols-[2.5rem_1fr] items-baseline gap-3 ${m.live ? 'border-l-4 border-aqours pl-3 -ml-4' : ''}`}
                >
                  <span className="font-led text-haze">{m.date.length > 4 ? m.date.slice(5) : ''}</span>
                  <span className={m.live ? 'text-xl font-bold leading-snug' : 'text-lg leading-snug'}>{pick(m.text, lang)}</span>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </section>
  )
}
