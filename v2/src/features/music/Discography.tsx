import { useRef, useState, type CSSProperties } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useShallow } from 'zustand/react/shallow'
import { releases } from '../../content/discography'
import { pick } from '../../content/types'
import { usePlayer } from '../../store/player'
import { useLang } from '../../store/lang'
import { useT } from '../../i18n'

const YEARS = [...new Set(releases.map((r) => r.year))]

export function Discography() {
  const t = useT()
  const lang = useLang((s) => s.lang)
  const [sel, setSel] = useState(0)
  const { playingIndex, status } = usePlayer(useShallow((s) => ({ playingIndex: s.index, status: s.status })))
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])
  const r = releases[sel]!
  const isCurrent = playingIndex === sel
  const spinning = isCurrent && status === 'playing'

  const select = (i: number, focus = false) => {
    const n = (i + releases.length) % releases.length
    setSel(n)
    const el = itemRefs.current[n]
    if (focus) el?.focus()
    el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }

  return (
    <section id="music" className="relative scroll-mt-20 overflow-hidden py-28" style={{ '--accent': r.accent } as CSSProperties}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_30%_40%,color-mix(in_oklab,var(--accent)_18%,transparent),transparent)] transition-colors duration-700" aria-hidden="true" />
      <div className="relative mx-auto max-w-6xl px-4">
        <p className="text-xs uppercase tracking-[0.25em] text-aqua">{t('disc.eyebrow')}</p>
        <h2 className="mt-4 font-display text-4xl md:text-6xl">{t('disc.h2')}</h2>

        <div className="mt-12 grid items-center gap-10 md:grid-cols-2">
          {/* Vinyl + cover */}
          <div className="relative mx-auto aspect-square w-full max-w-md">
            <div
              className={`absolute inset-[4%] left-[22%] rounded-full shadow-[0_0_80px_-10px_var(--accent)] ${spinning ? 'animate-spin-slow' : ''}`}
              style={{ background: 'repeating-radial-gradient(circle, #0b0b0f 0 2px, #16161d 2px 4px)' }}
              aria-hidden="true"
            >
              <img src={r.cover} alt="" className="absolute inset-[33%] rounded-full object-cover" />
            </div>
            <AnimatePresence mode="wait">
              <motion.img
                key={r.id}
                src={r.cover}
                alt={t('disc.cover', { title: r.title })}
                initial={{ opacity: 0, x: -24, rotate: -3 }}
                animate={{ opacity: 1, x: 0, rotate: 0 }}
                exit={{ opacity: 0, x: 24, rotate: 3 }}
                transition={{ duration: 0.35 }}
                className="absolute left-0 top-[12%] w-[64%] rounded-xl shadow-2xl shadow-black/60"
              />
            </AnimatePresence>
          </div>

          {/* Detail */}
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent)]">
              {r.year} · {pick(r.kind, lang)}
            </p>
            <h3 className="mt-3 font-display text-3xl md:text-5xl">{r.title}</h3>
            <p lang="ja" className="mt-2 text-mist">{r.titleJp}</p>
            <button
              type="button"
              onClick={() => (isCurrent ? usePlayer.getState().toggle() : usePlayer.getState().playAt(sel))}
              className="mt-8 inline-flex items-center gap-3 rounded-full bg-[var(--accent)] px-6 py-3 font-semibold text-sea-950 transition hover:brightness-110"
            >
              <span aria-hidden="true">{spinning ? '❚❚' : '▶'}</span>
              {spinning ? t('np.pause') : t('disc.playThis')}
            </button>
            <p className="mt-4 max-w-sm text-xs text-mist">{t('np.previewNote')}</p>
          </div>
        </div>

        {/* Year scrubber */}
        <div role="group" aria-label={t('disc.years')} className="mt-14 flex flex-wrap gap-2">
          {YEARS.map((y) => (
            <button
              key={y}
              type="button"
              aria-pressed={r.year === y}
              onClick={() => select(releases.findIndex((x) => x.year === y))}
              className="rounded-full border border-white/10 px-3 py-1 text-sm tabular-nums text-mist transition aria-pressed:border-[var(--accent)] aria-pressed:text-ink"
            >
              {y}
            </button>
          ))}
        </div>

        {/* Shelf */}
        <ul
          aria-label={t('disc.shelf')}
          className="mt-6 flex snap-x gap-4 overflow-x-auto pb-4"
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') { e.preventDefault(); select(sel + 1, true) }
            if (e.key === 'ArrowLeft') { e.preventDefault(); select(sel - 1, true) }
          }}
        >
          {releases.map((x, i) => (
            <li key={x.id} className="shrink-0 snap-center">
              <button
                ref={(el) => {
                  itemRefs.current[i] = el
                }}
                type="button"
                aria-pressed={i === sel}
                tabIndex={i === sel ? 0 : -1}
                aria-label={`${x.title} (${x.year})`}
                onClick={() => select(i)}
                className="block rounded-xl p-1 opacity-60 transition hover:opacity-100 aria-pressed:opacity-100 aria-pressed:ring-2 aria-pressed:ring-[var(--accent)]"
              >
                <img src={x.cover} alt="" loading="lazy" className="size-28 rounded-lg md:size-36" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
