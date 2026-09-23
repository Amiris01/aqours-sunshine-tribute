import type { CSSProperties } from 'react'
import { subunits } from '../../content/subunits'
import { asset } from '../../lib/asset'
import { SectionHeading } from '../../lib/SectionHeading'
import { useT } from '../../i18n'

/** Each unit gets a full-width stage banner in its colour, members as penlights. */
export function SubUnits() {
  const t = useT()
  return (
    <section id="units" className="scroll-mt-20 py-28">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading title="subunits.h2" lead="subunits.lead" />
      </div>
      <div className="mt-12 space-y-2">
        {subunits.map((u) => (
          <article
            key={u.name}
            style={{ '--u': u.color } as CSSProperties}
            className="grid bg-deep md:grid-cols-[minmax(17rem,30%)_1fr]"
          >
            {/* The unit's own colour, solid, like the banner hung for its stage. */}
            <h3 className="flex items-center justify-center bg-[var(--u)] px-6 py-8">
              <span className="inline-flex rounded-[3px] bg-white px-4 py-3">
                <img src={asset(u.logo)} alt={u.name} className="h-11 w-auto" />
              </span>
            </h3>
            <div className="grid items-center gap-6 px-4 py-8 md:grid-cols-[1fr_auto] md:gap-10 md:px-10 lg:pr-[max(2.5rem,calc((100vw-72rem)/2))]">
              <p className="max-w-[44ch] text-lg">{t(`subunit.tagline.${u.name}`)}</p>
              <ul className="flex gap-6">
                {u.members.map((m) => (
                  <li key={m.num} className="flex flex-col items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="block h-12 w-2 rounded-full"
                      style={{ background: m.color, boxShadow: `0 0 14px 2px ${m.color}` }}
                    />
                    <span className="text-sm">{m.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
