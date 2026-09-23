import { timeline } from '../../content/timeline'
import { pick } from '../../content/types'
import { SectionHeading } from '../../lib/SectionHeading'
import { useLang } from '../../store/lang'

/** Read like the dates on the back of a tour shirt. */
export function Journey() {
  const lang = useLang((s) => s.lang)
  return (
    <section id="journey" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-28">
      <SectionHeading title="journey.h2" />
      <ol className="mt-12 max-w-3xl space-y-5">
        {timeline.map((m) => (
          <li key={m.date + m.text.en} className="grid grid-cols-[6.5rem_1fr] gap-4 md:grid-cols-[8.5rem_1fr]">
            <span className="font-led text-lg text-haze md:text-xl">{m.date}</span>
            <span className="text-lg leading-snug">{pick(m.text, lang)}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}
