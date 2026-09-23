import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { useT } from '../../i18n'
import { asset } from '../../lib/asset'
import { hasWebGL } from '../../lib/webgl'
import { usePlayer } from '../../store/player'
import { HeroFallback } from './HeroFallback'

const SeaScene = lazy(() => import('./SeaScene'))

export function Hero() {
  const t = useT()
  const reduce = useReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(true)
  const [webgl] = useState(hasWebGL)
  const [failed, setFailed] = useState(false)

  // Unmount the canvas when the hero scrolls out of view (GPU/battery).
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => e && setVisible(e.isIntersecting))
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const show3d = webgl && !reduce && !failed && visible

  return (
    <section ref={ref} id="hero" className="relative flex min-h-svh items-end overflow-hidden pb-20 pt-28">
      <HeroFallback />
      {show3d && (
        <Suspense fallback={null}>
          <SeaScene onFail={() => setFailed(true)} />
        </Suspense>
      )}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-sea-950 to-transparent" aria-hidden="true" />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 mx-auto w-full max-w-6xl px-4"
      >
        <div className="flex items-center gap-3">
          <img src={asset(t('hero.seriesLogo'))} alt={t('hero.seriesLogoAlt')} className="h-8 w-auto md:h-10" />
          <span className="rounded-full border border-white/15 px-2.5 py-1 text-[11px] uppercase tracking-[0.2em] text-mist">
            {t('hero.eyebrowTag')}
          </span>
        </div>
        <h1 className="mt-6">
          <img src={asset('assets/logo/aqours-logo.png')} alt="Aqours" className="h-24 w-auto drop-shadow-[0_0_40px_rgba(63,214,255,0.35)] md:h-36" />
        </h1>
        <p className="mt-6 max-w-2xl font-display text-3xl leading-tight md:text-5xl">{t('hero.tagline')}</p>
        <div className="mt-10 flex flex-wrap items-center gap-6">
          <button
            type="button"
            onClick={() => usePlayer.getState().playAt(0)}
            className="group flex items-center gap-3 rounded-full bg-aqua px-6 py-3.5 font-semibold text-sea-950 shadow-[0_0_40px_-6px_rgba(63,214,255,0.7)] transition hover:brightness-110"
          >
            <span className="grid size-7 place-items-center rounded-full bg-sea-950 text-xs text-aqua" aria-hidden="true">▶</span>
            {t('hero.play')}
          </button>
          <a href="#about" className="text-sm text-mist transition hover:text-ink">{t('hero.scrollCue')} ↓</a>
        </div>
      </motion.div>
    </section>
  )
}
