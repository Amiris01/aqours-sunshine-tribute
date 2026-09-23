import { useT, type Key } from '../../i18n'
import { SectionHeading } from '../../lib/SectionHeading'

// From the school out to the prefecture, drawn like a stop list on a local line.
const ROUTE: Key[] = ['about.where.school', 'about.where.town', 'about.where.city', 'about.where.pref']

export function About() {
  const t = useT()
  return (
    <section id="about" className="mx-auto grid max-w-6xl scroll-mt-20 gap-14 px-4 py-28 md:grid-cols-[1.6fr_1fr] md:gap-16">
      <div>
        <SectionHeading title="about.h2" />
        <p data-testid="about-lead" className="mt-10 max-w-[38ch] text-2xl leading-snug md:text-[1.85rem] md:leading-[1.4]">
          {t('about.lead')}
        </p>
        <p className="mt-8 text-haze">{t('about.foot')}</p>
      </div>

      <aside className="self-center md:pt-24">
        <p className="text-sm text-haze" id="about-where">{t('about.whereLabel')}</p>
        <div className="relative mt-5">
          {/* The line the stops hang on, in Aqours blue. */}
          <span aria-hidden="true" className="absolute bottom-2 left-[7px] top-2 w-0.5 bg-aqours/60" />
          <ol aria-labelledby="about-where" className="space-y-6 pl-8">
          {ROUTE.map((key, i) => (
            <li key={key} className="relative">
              <span
                aria-hidden="true"
                className={`absolute -left-8 top-1.5 size-4 rounded-full border-2 border-aqours ${i === 0 ? 'bg-aqours' : 'bg-night'}`}
              />
              <span className={i === 0 ? 'font-display text-xl leading-snug' : 'text-lg'}>{t(key)}</span>
            </li>
            ))}
          </ol>
        </div>
        <p className="mt-10 border-t border-line pt-5 font-bold">{t('about.firstLive')}</p>
      </aside>
    </section>
  )
}
