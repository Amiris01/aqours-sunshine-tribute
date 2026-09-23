import { useEffect } from 'react'
import { MotionConfig } from 'motion/react'
import { useT } from './i18n'
import { useLang } from './store/lang'
import { SmoothScroll } from './features/layout/SmoothScroll'
import { TopBar } from './features/layout/TopBar'
import { Footer } from './features/layout/Footer'
import { Player } from './features/music/Player'
import { Hero } from './features/hero/Hero'
import { About } from './features/about/About'

export default function App() {
  const t = useT()
  const lang = useLang((s) => s.lang)
  useEffect(() => {
    document.title = t('meta.title')
    document.documentElement.lang = lang
  }, [t, lang])

  return (
    <MotionConfig reducedMotion="user">
      <SmoothScroll />
      <TopBar />
      <main id="top">
        <Hero />
        <About />
      </main>
      <Footer />
      <Player />
      <div className="grain" aria-hidden="true" />
    </MotionConfig>
  )
}
