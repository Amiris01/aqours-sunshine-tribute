import { useEffect, useRef, useState, lazy, Suspense } from 'react'
import { members, discs } from './data'
import { asset } from './assets'
import { useReveal, useCountUp } from './hooks'
import { useLang } from './i18n/LanguageContext'
import MemberSection from './components/MemberSection'
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
//   dotNav   : show/hide the right-side member dot rail
//   parallax : 'Strong' | 'Subtle' | 'Off'  -> hero parallax intensity
const CONFIG = {
  dotNav: true,
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
  const { dotNav, parallax } = CONFIG
  const mult = PARALLAX_MULT[parallax] ?? 1
  const { t, switching } = useLang()

  // Refs for scroll-driven elements written directly (no React re-render).
  const sunRef = useRef(null)
  const heroContentRef = useRef(null)
  const cueRef = useRef(null)
  const progressRef = useRef(null)
  const memberRefs = useRef([])

  const [activeDot, setActiveDot] = useState(-1)
  // Index into `discs` of the currently-docked track, or -1 when closed.
  const [playingIndex, setPlayingIndex] = useState(-1)
  // Hero WebGL canvas mounts only while the hero is on screen (perf).
  const [heroVisible, setHeroVisible] = useState(true)

  // About block reveal drives the count-up stats.
  const [aboutRef, aboutShown] = useReveal()
  const memberCount = useCountUp(9, aboutShown)
  const subunitCount = useCountUp(3, aboutShown)

  const [membersHeadRef, membersHeadShown] = useReveal()
  const [discHeadRef, discHeadShown] = useReveal()
  const [footRef, footShown] = useReveal()

  // --- Hero parallax + progress bar (direct style writes on scroll) --------
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
      if (progressRef.current) {
        const h = document.documentElement.scrollHeight - window.innerHeight
        progressRef.current.style.transform = `scaleX(${h > 0 ? y / h : 0})`
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [mult])

  // --- Dot rail active state (which member straddles the viewport middle) ---
  useEffect(() => {
    if (!dotNav) return
    const sections = memberRefs.current.filter(Boolean)
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveDot(Number(e.target.dataset.idx))
        })
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    )
    sections.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [dotNav])

  const scrollToMember = (i) => {
    const t = memberRefs.current[i]
    if (t)
      window.scrollTo({
        top: window.scrollY + t.getBoundingClientRect().top - 90,
        behavior: 'smooth',
      })
  }

  // --- Roster carousel: scroll the track by ~one card per arrow press ------
  const rosterTrackRef = useRef(null)
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
      <div className="progress" ref={progressRef} />
      <LangSwitch />

      {dotNav && (
        <div className="dots">
          {members.map((m, i) => (
            <button
              key={m.num}
              className={`dot${activeDot === i ? ' on' : ''}`}
              style={{ '--c': m.color }}
              aria-label={m.name}
              onClick={() => scrollToMember(i)}
            />
          ))}
        </div>
      )}

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
          <div className="eyebrow">{t('about.eyebrow')}</div>
          <h2 className="h2">{t('about.h2')}</h2>
          <p className="lead">{t('about.lead')}</p>
          <div className="stats">
            <div>
              <div className="stat-num">{memberCount}</div>
              <div className="stat-label">{t('about.stat.members')}</div>
            </div>
            <div>
              <div className="stat-num blue">{subunitCount}</div>
              <div className="stat-label">{t('about.stat.subunits')}</div>
            </div>
            <div>
              <div className="stat-num">2015</div>
              <div className="stat-label">{t('about.stat.debut')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Members header --- */}
      <div
        ref={membersHeadRef}
        className={`members-head reveal${membersHeadShown ? ' in' : ''}`}
      >
        <div className="eyebrow">{t('members.eyebrow')}</div>
        <h2 className="h2">{t('members.h2')}</h2>
        <p className="lead">{t('members.lead')}</p>
      </div>

      {/* --- Roster carousel: swipe / arrow through the nine, click to jump --- */}
      <div className="roster-carousel">
        <button
          type="button"
          className="roster-arrow prev"
          aria-label="Previous members"
          onClick={() => scrollRoster(-1)}
        >
          ‹
        </button>
        <div className="roster-track" ref={rosterTrackRef}>
          {members.map((m, i) => (
            <button
              key={m.num}
              type="button"
              className="roster-item"
              style={{ '--c': m.color }}
              onClick={() => scrollToMember(i)}
              aria-label={`Jump to ${m.name}`}
            >
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
            </button>
          ))}
        </div>
        <button
          type="button"
          className="roster-arrow next"
          aria-label="Next members"
          onClick={() => scrollRoster(1)}
        >
          ›
        </button>
      </div>

      {/* --- Member sections: full-width bands, alternating L/R --- */}
      {members.map((m, i) => (
        <MemberSection
          key={m.num}
          m={m}
          idx={i}
          ref={(el) => {
            memberRefs.current[i] = el
          }}
        />
      ))}

      {/* --- Sub-units --- */}
      <SubUnits />

      {/* --- Discography --- */}
      <section className="section disc-section">
        <div className="disc-vinyl" aria-hidden="true" />
        <div
          ref={discHeadRef}
          className={`disc-head reveal${discHeadShown ? ' in' : ''}`}
        >
          <div className="eyebrow">{t('disc.eyebrow')}</div>
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
