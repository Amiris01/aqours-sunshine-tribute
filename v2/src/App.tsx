import { lazy, Suspense, useEffect, useRef } from 'react'
import { LazyMotion, MotionConfig } from 'motion/react'
import { useT } from './i18n'
import { useLang } from './store/lang'
import { usePlayer } from './store/player'
import { ErrorBoundary } from './lib/ErrorBoundary'
import { SmoothScroll } from './features/layout/SmoothScroll'
import { TopBar } from './features/layout/TopBar'
import { Footer } from './features/layout/Footer'
import { Hero } from './features/hero/Hero'
import { About } from './features/about/About'
import { Members } from './features/members/Members'
import { SubUnits } from './features/subunits/SubUnits'
import { Discography } from './features/music/Discography'
import { Journey } from './features/journey/Journey'

// Split out of the entry chunk: the player (Radix Slider) until first play,
// Motion's animation features until after first paint.
const Player = lazy(() => import('./features/music/Player').then((mod) => ({ default: mod.Player })))
const loadMotionFeatures = () => import('./motion/features').then((mod) => mod.default)

export default function App() {
  const t = useT()
  const lang = useLang((s) => s.lang)
  const active = usePlayer((s) => s.index >= 0)
  const playerMounted = useRef(false)
  if (active) playerMounted.current = true

  useEffect(() => {
    document.title = t('meta.title')
    document.documentElement.lang = lang
  }, [t, lang])

  return (
    <LazyMotion features={loadMotionFeatures} strict>
      <MotionConfig reducedMotion="user">
        <SmoothScroll />
        <TopBar />
        <main id="top">
          <Hero />
          <About />
          <Members />
          <SubUnits />
          <Discography />
          <Journey />
        </main>
        <Footer />
        {playerMounted.current && (
          <ErrorBoundary fallback={null}>
            <Suspense fallback={null}>
              <Player />
            </Suspense>
          </ErrorBoundary>
        )}
        <div className="grain" aria-hidden="true" />
      </MotionConfig>
    </LazyMotion>
  )
}
