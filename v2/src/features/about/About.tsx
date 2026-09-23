import { useT } from '../../i18n'
import { SectionHeading } from '../../lib/SectionHeading'

export function About() {
  const t = useT()
  return (
    <section id="about" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-28">
      <SectionHeading title="about.h2" />
      <p data-testid="about-lead" className="mt-10 max-w-[38ch] text-2xl leading-snug md:text-[2rem] md:leading-[1.35]">
        {t('about.lead')}
      </p>
      <p className="mt-8 text-haze">{t('about.foot')}</p>
    </section>
  )
}
