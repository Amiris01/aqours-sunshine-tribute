import { useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { AnimatePresence, m as motion } from 'motion/react'
import { DUR, EASE } from '../../motion/tokens'
import { releases } from '../../content/discography'
import { pick } from '../../content/types'
import { onColor } from '../../lib/color'
import { PauseIcon, PlayIcon } from '../../lib/icons'
import { SectionHeading } from '../../lib/SectionHeading'
import { usePlayer } from '../../store/player'
import { useLang } from '../../store/lang'
import { useT } from '../../i18n'

const code = (i: number) => `M${String(i + 1).padStart(2, '0')}`

/** The discography as a concert setlist: M01…M08 in release order. */
export function Discography() {
  const t = useT()
  const lang = useLang((s) => s.lang)
  const [sel, setSel] = useState(0)
  const { playingIndex, status } = usePlayer(useShallow((s) => ({ playingIndex: s.index, status: s.status })))
  const rowRefs = useRef<(HTMLButtonElement | null)[]>([])

  const onKey = (e: KeyboardEvent, i: number) => {
    const d = e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0
    if (!d) return
    e.preventDefault()
    const n = (i + d + releases.length) % releases.length
    setSel(n)
    rowRefs.current[n]?.focus()
  }

  return (
    <section id="music" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-28">
      <SectionHeading title="disc.h2" lead="disc.lead" />
      <ol className="mt-12 border-t border-line">
        {releases.map((r, i) => {
          const open = i === sel
          const onAir = playingIndex === i && status !== 'idle' && status !== 'error'
          const playing = playingIndex === i && status === 'playing'
          return (
            <li key={r.id} className="border-b border-line" style={{ '--accent': r.accent } as CSSProperties}>
              <button
                ref={(el) => {
                  rowRefs.current[i] = el
                }}
                type="button"
                aria-expanded={open}
                aria-controls={`setlist-${r.id}`}
                onClick={() => setSel(i)}
                onKeyDown={(e) => onKey(e, i)}
                className="grid w-full grid-cols-[3rem_3rem_1fr_auto] items-center gap-x-4 py-4 text-left transition hover:bg-deep/60 md:grid-cols-[4.5rem_3.5rem_1fr_14rem_4rem]"
              >
                <span className={`font-led text-lg ${onAir ? 'text-[var(--accent)]' : 'text-haze'}`}>
                  {code(i)}
                </span>{' '}
                <img src={r.cover} alt="" loading="lazy" className="size-12 rounded-[3px] object-cover md:size-14" />
                <span>
                  <span lang="ja" className="block text-xl font-bold leading-snug md:text-2xl">{r.titleJp}</span>
                  {' '}<span className="mt-1 block text-haze">{r.title}</span>
                  {onAir && (
                    <span className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-[var(--accent)]">
                      {/* Equaliser: bounces while playing, holds still when paused or motion is reduced. */}
                      <span data-testid="eq" aria-hidden="true" className="flex h-3.5 items-end gap-[3px]">
                        {[0, 0.25, 0.5].map((d) => (
                          <span
                            key={d}
                            className={`block h-full w-[3px] origin-bottom bg-[var(--accent)] ${playing ? 'eq-bar' : 'scale-y-50'}`}
                            style={{ animationDelay: `${-d}s` }}
                          />
                        ))}
                      </span>
                      {' '}{t('np.onAir')}
                    </span>
                  )}
                </span>{' '}
                <span className="hidden text-sm text-haze md:block">{pick(r.kind, lang)}</span>{' '}
                <span className="font-led text-lg">{r.year}</span>
              </button>
              {/* Rows slide open and closed; the content fades in just behind the height. */}
              <AnimatePresence initial={false}>
                {open && (
                <motion.div
                  key="panel"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ height: { duration: DUR.base, ease: EASE }, opacity: { duration: DUR.quick, ease: EASE } }}
                  className="overflow-hidden"
                >
                <div id={`setlist-${r.id}`} className="grid gap-6 pb-8 md:grid-cols-[4.5rem_12rem_1fr] md:gap-x-4">
                  <span aria-hidden="true" className="hidden md:block" />
                  <img
                    src={r.cover}
                    alt={t('disc.cover', { title: r.title })}
                    className="size-40 rounded-[4px] object-cover md:size-44"
                  />
                  <div className="md:pl-4">
                    <p className="text-sm text-haze md:hidden">{pick(r.kind, lang)}</p>
                    <p data-testid="release-blurb" className="max-w-[52ch] text-lg leading-relaxed">{pick(r.blurb, lang)}</p>
                    <button
                      type="button"
                      aria-label={playing ? t('np.pause') : t('disc.playThis', { title: r.title })}
                      onClick={() =>
                        playingIndex === i && status !== 'error' ? usePlayer.getState().toggle() : usePlayer.getState().playAt(i)
                      }
                      style={{ color: onColor(r.accent) }}
                      className="mt-6 inline-flex items-center gap-3 rounded-[3px] bg-[var(--accent)] px-5 py-3 font-bold transition hover:brightness-110"
                    >
                      {playing ? <PauseIcon /> : <PlayIcon />}
                      {playing ? t('np.pause') : t('np.play')}
                    </button>
                    <p className="mt-4 max-w-[52ch] text-sm text-haze">{t('np.previewNote')}</p>
                  </div>
                </div>
                </motion.div>
                )}
              </AnimatePresence>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
