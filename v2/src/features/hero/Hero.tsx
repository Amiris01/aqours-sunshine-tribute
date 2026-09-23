import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { m as motion, useReducedMotion } from 'motion/react'
import { useT } from '../../i18n'
import { asset } from '../../lib/asset'
import { hasWebGL } from '../../lib/webgl'
import { PlayIcon } from '../../lib/icons'
import { usePlayer } from '../../store/player'
import { ErrorBoundary } from '../../lib/ErrorBoundary'
import { HeroFallback } from './HeroFallback'
import { Penlights } from './Penlights'

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
    <section ref={ref} id="hero" className="relative flex min-h-svh flex-col justify-end overflow-hidden">
      <HeroFallback sea={!show3d} />
      {show3d && (
        <ErrorBoundary fallback={null} onError={() => setFailed(true)}>
          <Suspense fallback={null}>
            <SeaScene onFail={() => setFailed(true)} />
          </Suspense>
        </ErrorBoundary>
      )}
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-night via-night/70 to-transparent" aria-hidden="true" />

      {/* The one orchestrated entrance on the page. */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 mx-auto w-full max-w-6xl px-4 pt-28"
      >
        <div className="flex items-center gap-3">
          <img src={asset(t('hero.seriesLogo'))} alt={t('hero.seriesLogoAlt')} className="h-8 w-auto md:h-10" />
          <span className="text-sm text-haze">{t('hero.eyebrowTag')}</span>
        </div>
        <h1 className="mt-5">
          <img
            src={asset('assets/logo/aqours-logo.webp')}
            alt="Aqours"
            width={900}
            height={336}
            fetchPriority="high"
            className="h-20 w-auto md:h-28"
          />
        </h1>
        <p className="mt-6 max-w-4xl font-display text-[clamp(1.9rem,5.2vw,4.25rem)] leading-[1.12]">{t('hero.tagline')}</p>
        <button
          type="button"
          onClick={() => usePlayer.getState().playAt(0)}
          className="mt-9 inline-flex items-center gap-3 rounded-[3px] bg-ink px-5 py-3 font-bold text-night transition hover:bg-white"
        >
          <PlayIcon />
          {t('hero.play')}
        </button>
      </motion.div>

      <div className="mt-12 md:mt-16">
        <Penlights />
      </div>
    </section>
  )
}
