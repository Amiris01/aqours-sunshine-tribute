import { motion } from 'motion/react'
import { subunits } from '../../content/subunits'
import { memberAssets } from '../../content/members'
import { asset } from '../../lib/asset'
import { useT } from '../../i18n'

export function SubUnits() {
  const t = useT()
  return (
    <section id="units" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-28">
      <p className="text-xs uppercase tracking-[0.25em] text-aqua">{t('subunits.eyebrow')}</p>
      <h2 className="mt-4 font-display text-4xl md:text-6xl">{t('subunits.h2')}</h2>
      <p className="mt-4 max-w-2xl text-mist">{t('subunits.lead')}</p>
      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {subunits.map((u, i) => (
          <motion.article
            key={u.name}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10%' }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-sea-900 p-6"
          >
            <div
              className="absolute inset-0"
              style={{ background: `radial-gradient(120% 80% at 0% 0%, color-mix(in oklab, ${u.color} 35%, transparent), transparent 60%)` }}
              aria-hidden="true"
            />
            <h3 className="relative">
              <span className="inline-flex rounded-xl bg-white/90 px-3 py-2">
                <img src={asset(u.logo)} alt={u.name} className="h-10 w-auto" />
              </span>
            </h3>
            <p className="relative mt-4 text-mist">{t(`subunit.tagline.${u.name}`)}</p>
            <ul className="relative mt-6 space-y-2">
              {u.members.map((m) => (
                <li key={m.num} className="flex items-center gap-3">
                  <img src={memberAssets(m).emblem} alt="" className="size-8" />
                  <span>{m.name}</span>
                  <span className="ml-auto size-2.5 rounded-full" style={{ background: m.color }} aria-hidden="true" />
                </li>
              ))}
            </ul>
          </motion.article>
        ))}
      </div>
    </section>
  )
}
