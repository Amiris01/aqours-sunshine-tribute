import { useEffect, useRef, useState, lazy, Suspense } from 'react'
import { members, discs } from './data'
import { asset } from './assets'
import { useReveal } from './hooks'
import { useLang } from './i18n/LanguageContext'
import { useGsap } from './anim/useGsap'
import { gsapReveal } from './anim/gsapReveal'
import MemberShowcase from './components/MemberShowcase'
import DiscCard from './components/DiscCard'
import NowPlayingBar from './components/NowPlayingBar'
import SubUnits from './components/SubUnits'
import LangSwitch from './components/LangSwitch'
import Waves from './components/Waves'

// WebGL hero is decorative + heavy (pulls in three.js). Load it on demand so
// three is split out of the initial bundle; the CSS sky fallback shows until
// it's ready (and remains under reduced-motion / WebGL-unavailable).
const WaterBackground = lazy(() => import('./components/WaterBackground'))

// --- Tweakable options (exposed in the prototype) --------------------------
//   parallax : 'Strong' | 'Subtle' | 'Off'  -> hero parallax intensity
const CONFIG = {
  parallax: 'Strong',
}
const PARALLAX_MULT = { Strong: 1, Subtle: 0.45, Off: 0 }

function FootWave() {
  return (
    <div className="foot-wave">
      <svg viewBox="0 0 1440 100" preserveAspectRatio="none">
        <path d="M0,0 L1440,0 L1440,42 C1080,92 360,-8 0,42 Z" fill="#fff9ef" />
      </svg>
    </div>
  )
}

export default function App() {
  const { parallax } = CONFIG
  const mult = PARALLAX_MULT[parallax] ?? 1
  const { t, switching } = useLang()

  // Refs for scroll-driven elements written directly (no React re-render).
  const sunRef = useRef(null)
  const heroContentRef = useRef(null)
  const cueRef = useRef(null)
  // Roster carousel track (declared up here so the GSAP reveal effect can read it).
  const rosterTrackRef = useRef(null)
  // Index into `discs` of the currently-docked track, or -1 when closed.
  const [playingIndex, setPlayingIndex] = useState(-1)
  // Hero WebGL canvas mounts only while the hero is on screen (perf).
  const [heroVisible, setHeroVisible] = useState(true)

  const [aboutRef, aboutShown] = useReveal()

  const [membersHeadRef, membersHeadShown] = useReveal()
  const [discHeadRef, discHeadShown] = useReveal()
  const [footRef, footShown] = useReveal()

  const { gsap, ScrollTrigger, ready: gsapReady } = useGsap()

  // --- Hero parallax (direct style writes on scroll) -----------------------
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      if (sunRef.current)
        sunRef.current.style.transform = `translateX(-50%) translateY(${y * 0.28 * mult}px)`
      if (heroContentRef.current) {
        heroContentRef.current.style.transform = `translateY(${y * 0.42 * mult}px)`
        heroContentRef.current.style.opacity = Math.max(0, 1 - y / 560)
      }
      if (cueRef.current) cueRef.current.style.opacity = Math.max(0, 1 - y / 240)
      setHeroVisible(y < window.innerHeight)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [mult])

  // --- GSAP scroll-reveal animations: About stagger + Roster deal-in (Task 6)
  //     + Discography vinyl spin + disc cascade + Footer rise (Task 8) --------
  useEffect(() => {
    if (!gsapReady || !gsap || !ScrollTrigger) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const cleanups = []

    // About: stagger the heading + lead + footnote.
    const aboutEl = aboutRef.current
    if (aboutEl) {
      const kids = aboutEl.querySelectorAll('.h2, .lead, .about-foot')
      cleanups.push(gsapReveal(gsap, ScrollTrigger, aboutEl, { children: kids, stagger: 0.12 }))
    }
    // Task 6 — Roster: deal the cards in L->R.
    const track = rosterTrackRef.current
    if (track) {
      const cards = track.querySelectorAll('.roster-item')
      cleanups.push(gsapReveal(gsap, ScrollTrigger, track, { children: cards, stagger: 0.06, y: 30 }))
    }

    // Task 8 — Discography: spin the vinyl in + cascade the disc tiles.
    const vinyl = document.querySelector('.disc-vinyl')
    if (vinyl) {
      const t = gsap.fromTo(
        vinyl,
        { autoAlpha: 0, rotate: -90, scale: 0.8 },
        { autoAlpha: 0.85, rotate: 0, scale: 1, duration: 1.1, ease: 'power2.out',
          scrollTrigger: { trigger: '.disc-section', start: 'top 75%', toggleActions: 'play none none none' } }
      )
      cleanups.push(() => { if (t.scrollTrigger) t.scrollTrigger.kill(); t.kill() })
    }
    const discGrid = document.querySelector('.disc')
    if (discGrid) {
      const tiles = discGrid.querySelectorAll('.disc-tile')
      cleanups.push(gsapReveal(gsap, ScrollTrigger, discGrid, { children: tiles, stagger: 0.07, y: 40 }))
    }
    // Task 8 — Footer: mark/sub/note rise together.
    const foot = document.querySelector('.foot .reveal') || document.querySelector('.foot')
    if (foot) {
      const kids = foot.querySelectorAll('.foot-mark, .foot-sub, .foot-note')
      cleanups.push(gsapReveal(gsap, ScrollTrigger, foot, { children: kids, stagger: 0.1 }))
    }

    return () => cleanups.forEach((fn) => fn())
  }, [gsapReady, gsap, ScrollTrigger])

  // --- Roster carousel: scroll the track by ~one card per arrow press ------
  const scrollRoster = (dir) => {
    const track = rosterTrackRef.current
    if (!track) return
    const card = track.querySelector('.roster-item')
    const gap = parseFloat(getComputedStyle(track).columnGap || '0') || 22
    const step = card ? card.offsetWidth + gap : track.clientWidth * 0.8
    track.scrollBy({ left: dir * step, behavior: 'smooth' })
  }

  return (
    <div className={`page${switching ? ' lang-switching' : ''}`}>
      <LangSwitch />

      {/* --- Hero --- */}
      <div className="hero">
        <Suspense fallback={null}>
          <WaterBackground active={heroVisible} />
        </Suspense>
        {/* CSS fallback (shown when WebGL off / reduced-motion) */}
        <div className="hero-fallback">
          <div className="sky" />
          <div className="sun" ref={sunRef}>
            <div className="sun-core" />
          </div>
          <div className="cloud c1" />
          <div className="cloud c2" />
          <div className="cloud c3" />
        </div>
        <div className="hero-content asym" ref={heroContentRef}>
          <div className="hero-eyebrow">
            <img
              className="hero-series-logo"
              src={asset(t('hero.seriesLogo'))}
              alt={t('hero.seriesLogoAlt')}
            />
            <span className="hero-eyebrow-tag">{t('hero.eyebrowTag')}</span>
          </div>
          <img className="hero-logo-img" src={asset('assets/logo/aqours-logo.png')} alt="Aqours" />
          <div className="tagline">{t('hero.tagline')}</div>
        </div>
        <div className="scroll-cue" ref={cueRef}>
          {t('hero.scrollCue')}<span className="arrow">↓</span>
        </div>
        <Waves />
      </div>

      {/* --- About / Intro --- */}
      <section className="section pace-tight">
        <div ref={aboutRef} className={`reveal${aboutShown ? ' in' : ''}`}>
          <h2 className="h2">{t('about.h2')}</h2>
          <p className="lead">{t('about.lead')}</p>
          <p className="about-foot">{t('about.foot')}</p>
        </div>
      </section>

      {/* --- Members header --- */}
      <div
        ref={membersHeadRef}
        className={`members-head reveal${membersHeadShown ? ' in' : ''}`}
      >
        <h2 className="h2">{t('members.h2')}</h2>
        <p className="lead">{t('members.lead')}</p>
      </div>

      {/* --- Roster carousel: display strip of the nine, swipe / arrow to scroll --- */}
      <div className="roster-carousel">
        <button
          type="button"
          className="roster-arrow prev"
          aria-label="Previous members"
          onClick={() => scrollRoster(-1)}
        >
          <span className="chevron" aria-hidden="true" />
        </button>
        <div className="roster-track" ref={rosterTrackRef}>
          {members.map((m) => (
            <div key={m.num} className="roster-item" style={{ '--c': m.color }}>
              <span className="roster-stage">
                {m.portrait && (
                  <img className="roster-img" src={m.portrait} alt={m.name} loading="lazy" />
                )}
              </span>
              <span className="roster-foot">
                {m.emblem && (
                  <img className="roster-emblem" src={m.emblem} alt="" aria-hidden="true" />
                )}
                <span className="roster-name">{m.name.split(' ')[0]}</span>
              </span>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="roster-arrow next"
          aria-label="Next members"
          onClick={() => scrollRoster(1)}
        >
          <span className="chevron" aria-hidden="true" />
        </button>
      </div>

      {/* --- Member showcase: pinned cinematic slideshow (desktop) --- */}
      <MemberShowcase members={members} />

      {/* --- Sub-units --- */}
      <SubUnits />

      {/* --- Discography --- */}
      <section className="section disc-section">
        <div className="disc-vinyl" aria-hidden="true" />
        <div
          ref={discHeadRef}
          className={`disc-head reveal${discHeadShown ? ' in' : ''}`}
        >
          <h2 className="h2">{t('disc.h2')}</h2>
        </div>
        <div className="disc">
          {discs.map((d, i) => (
            <DiscCard
              key={d.title}
              d={d}
              index={i}
              isPlaying={playingIndex === i}
              onPlay={() => setPlayingIndex(i)}
            />
          ))}
        </div>
      </section>

      {/* --- Footer --- */}
      <div className="foot">
        <FootWave />
        <div ref={footRef} className={`reveal${footShown ? ' in' : ''}`}>
          <div className="foot-mark">{t('foot.mark')}</div>
          <div className="foot-sub">{t('foot.sub')}</div>
          <p className="foot-note">{t('foot.note')}</p>
        </div>
      </div>

      <NowPlayingBar
        tracks={discs}
        index={playingIndex}
        onIndexChange={setPlayingIndex}
        onClose={() => setPlayingIndex(-1)}
      />
    </div>
  )
}
