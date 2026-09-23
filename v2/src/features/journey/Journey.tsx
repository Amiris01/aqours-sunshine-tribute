import { m as motion } from 'motion/react'
import { timeline } from '../../content/timeline'
import { pick } from '../../content/types'
import { useT } from '../../i18n'
import { useLang } from '../../store/lang'

export function Journey() {
  const t = useT()
  const lang = useLang((s) => s.lang)
  return (
    <section id="journey" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-28">
      <p className="text-xs uppercase tracking-[0.25em] text-aqua">{t('journey.eyebrow')}</p>
      <h2 className="mt-4 font-display text-4xl md:text-6xl">{t('journey.h2')}</h2>
      <ol className="mt-12 grid gap-6 border-l border-white/10 pl-6 md:grid-cols-3 md:gap-x-6 md:gap-y-10 md:border-l-0 md:pl-0 lg:grid-cols-5">
        {timeline.map((m, i) => (
          <motion.li
            key={m.when.en + i}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10%' }}
            transition={{ duration: 0.5, delay: Math.min(i * 0.05, 0.3) }}
            className="relative md:border-t md:border-white/10 md:pt-6"
          >
            <span
              className="absolute -left-[29px] top-1.5 size-2.5 rounded-full bg-aqua shadow-[0_0_12px_var(--color-aqua)] md:-top-[5px] md:left-0"
              aria-hidden="true"
            />
            <p className="text-sm font-semibold text-aqua">{pick(m.when, lang)}</p>
            <p className="mt-1 text-ink/90">{pick(m.text, lang)}</p>
          </motion.li>
        ))}
      </ol>
    </section>
  )
}
