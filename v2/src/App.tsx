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
import { Members } from './features/members/Members'
import { SubUnits } from './features/subunits/SubUnits'
import { Discography } from './features/music/Discography'
import { Journey } from './features/journey/Journey'

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
        <Members />
        <SubUnits />
        <Discography />
        <Journey />
      </main>
      <Footer />
      <Player />
      <div className="grain" aria-hidden="true" />
    </MotionConfig>
  )
}
