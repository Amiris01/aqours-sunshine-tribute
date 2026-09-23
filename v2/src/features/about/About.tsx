import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { useT } from '../../i18n'
import { useLang } from '../../store/lang'
import { segmentWords } from '../../lib/segment'
import { loadGsap } from '../../motion/gsap'

export function About() {
  const t = useT()
  const lang = useLang((s) => s.lang)
  const reduce = useReducedMotion()
  const ref = useRef<HTMLElement>(null)

  // Words brighten as the statement scrolls through (scrubbed on desktop).
  useEffect(() => {
    const el = ref.current
    if (reduce || !el) return
    let cancelled = false
    let revert = () => {}
    void loadGsap().then(({ gsap }) => {
      if (cancelled) return
      const ctx = gsap.context(() => {
        const mm = gsap.matchMedia()
        mm.add('(min-width: 900px)', () => {
          gsap.fromTo('.about-word', { opacity: 0.15 }, {
            opacity: 1, stagger: 0.04, ease: 'none',
            scrollTrigger: { trigger: el, start: 'top 75%', end: 'bottom 55%', scrub: true },
          })
        })
        mm.add('(max-width: 899px)', () => {
          gsap.from('.about-word', { opacity: 0.15, stagger: 0.015, duration: 0.6, scrollTrigger: { trigger: el, start: 'top 80%' } })
        })
      }, el)
      revert = () => ctx.revert()
    })
    return () => {
      cancelled = true
      revert()
    }
  }, [reduce, lang])

  return (
    <section ref={ref} id="about" className="mx-auto max-w-5xl scroll-mt-20 px-4 py-32">
      <p className="text-xs uppercase tracking-[0.25em] text-aqua">{t('about.eyebrow')}</p>
      <h2 className="mt-4 font-display text-4xl md:text-6xl">{t('about.h2')}</h2>
      <p data-testid="about-lead" className="mt-10 text-2xl leading-snug md:text-4xl md:leading-tight">
        {segmentWords(t('about.lead'), lang).map((w, i) => (
          <span key={i} className="about-word">{w}</span>
        ))}
      </p>
      <p className="mt-10 text-sm text-mist">{t('about.foot')}</p>
    </section>
  )
}
