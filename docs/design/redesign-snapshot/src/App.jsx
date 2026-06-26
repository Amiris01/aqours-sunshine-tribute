import { useEffect, useRef, useState } from 'react'
import { members, discs } from './data'
import { useReveal, useCountUp } from './hooks'
import MemberSection from './components/MemberSection'
import DiscCard from './components/DiscCard'
import NowPlayingBar from './components/NowPlayingBar'
import SubUnits from './components/SubUnits'
import Waves from './components/Waves'

// --- Tweakable options (exposed in the prototype) --------------------------
//   dotNav   : show/hide the desktop member spine (right-side numbered rail)
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

  // Refs for scroll-driven elements written directly (no React re-render).
  const sunRef = useRef(null)
  const heroContentRef = useRef(null)
  const cueRef = useRef(null)
  const progressRef = useRef(null)
  const memberRefs = useRef([])
  const memtabsRef = useRef(null)
  const tabRefs = useRef([])

  const [activeDot, setActiveDot] = useState(0)
  // Index into `discs` of the currently-docked track, or -1 when closed.
  const [playingIndex, setPlayingIndex] = useState(-1)

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
        sunRef.current.style.transform = `translateY(${y * 0.28 * mult}px)`
      if (heroContentRef.current) {
        heroContentRef.current.style.transform = `translateY(${y * 0.42 * mult}px)`
        heroContentRef.current.style.opacity = Math.max(0, 1 - y / 620)
      }
      if (cueRef.current) cueRef.current.style.opacity = Math.max(0, 1 - y / 240)
      if (progressRef.current) {
        const h = document.documentElement.scrollHeight - window.innerHeight
        progressRef.current.style.transform = `scaleX(${h > 0 ? y / h : 0})`
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [mult])

  // --- Active member (drives both the desktop spine and the mobile tabs) ---
  useEffect(() => {
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
  }, [])

  // Keep the active mobile tab in view without using scrollIntoView.
  useEffect(() => {
    const strip = memtabsRef.current
    const tab = tabRefs.current[activeDot]
    if (!strip || !tab) return
    const target = tab.offsetLeft - strip.clientWidth / 2 + tab.clientWidth / 2
    strip.scrollTo({ left: Math.max(0, target), behavior: 'smooth' })
  }, [activeDot])

  const scrollToMember = (i) => {
    const t = memberRefs.current[i]
    if (t)
      window.scrollTo({
        top: window.scrollY + t.getBoundingClientRect().top - 72,
        behavior: 'smooth',
      })
  }

  return (
    <div className="page">
      <div className="progress" ref={progressRef} />

      {dotNav && (
        <div className="dots" role="navigation" aria-label="Jump to member">
          {members.map((m, i) => (
            <button
              key={m.num}
              className={`dot${activeDot === i ? ' on' : ''}`}
              style={{ '--c': m.color }}
              aria-label={m.name}
              aria-current={activeDot === i ? 'true' : undefined}
              onClick={() => scrollToMember(i)}
            >
              <span>{m.num}</span>
            </button>
          ))}
        </div>
      )}

      {/* --- Hero --- */}
      <div className="hero">
        <div className="sky" />
        <div className="sun" ref={sunRef}>
          <div className="sun-core" />
        </div>
        <div className="cloud c1" />
        <div className="cloud c2" />
        <div className="cloud c3" />
        <div className="hero-content" ref={heroContentRef}>
          <div className="hero-eyebrow">Love Live! Sunshine!! · Fan Tribute</div>
          <img className="hero-logo-img" src="/assets/logo/aqours-logo.png" alt="Aqours" />
          <div className="tagline">Shine with us — here, now, by the sea.</div>
          <div className="hero-strip" aria-hidden="true">
            {members.map((m) => (
              <span key={m.num} className="hero-chip" style={{ '--c': m.color }} />
            ))}
          </div>
        </div>
        <div className="scroll-cue" ref={cueRef}>
          Scroll to dive in<span className="arrow">↓</span>
        </div>
        <Waves />
      </div>

      {/* --- About / Intro --- */}
      <section className="section">
        <div ref={aboutRef} className={`about reveal${aboutShown ? ' in' : ''}`}>
          <div className="about-copy">
            <div className="eyebrow">School Idol Project</div>
            <h2 className="h2">Nine girls, one shining sea.</h2>
            <p className="lead">
              Aqours is the school idol group of Uranohoshi Girls' High School in Numazu, on
              Japan's sun-soaked Shizuoka coast. Refusing to watch their school quietly fade
              away, nine friends chase a single radiant dream — to shine, here and now, with
              everything they've got.
            </p>
          </div>
          <div className="stats">
            <div className="stat">
              <span className="stat-num">{memberCount}</span>
              <span className="stat-label">Members, nine colors</span>
            </div>
            <div className="stat">
              <span className="stat-num blue">{subunitCount}</span>
              <span className="stat-label">Sub-units</span>
            </div>
            <div className="stat">
              <span className="stat-num purple">2016</span>
              <span className="stat-label">Debut year</span>
            </div>
          </div>
        </div>
      </section>

      {/* --- Members header --- */}
      <div
        ref={membersHeadRef}
        className={`members-head reveal${membersHeadShown ? ' in' : ''}`}
      >
        <div className="eyebrow">Meet Aqours</div>
        <h2 className="h2">Nine hearts, nine colors.</h2>
        <p className="lead">
          Each member shines in her own hue — every profile below is themed to her image
          color. Scroll through, or tap a color to jump straight to her.
        </p>
      </div>

      {/* --- Mobile member navigator: sticky color tabs --- */}
      <div className="memtabs" ref={memtabsRef} role="navigation" aria-label="Jump to member">
        {members.map((m, i) => (
          <button
            key={m.num}
            ref={(el) => { tabRefs.current[i] = el }}
            className={`memtab${activeDot === i ? ' on' : ''}`}
            style={{ '--c': m.color }}
            aria-label={m.name}
            aria-current={activeDot === i ? 'true' : undefined}
            onClick={() => scrollToMember(i)}
          >
            {m.num}
          </button>
        ))}
      </div>

      {/* --- Member sections --- */}
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
      <section className="section">
        <div ref={discHeadRef} className={`reveal${discHeadShown ? ' in' : ''}`}>
          <div className="eyebrow">Discography · 2015–2024</div>
          <h2 className="h2">Songs that shine.</h2>
        </div>
        <div className="disc">
          {discs.map((d, i) => (
            <DiscCard
              key={d.title}
              d={d}
              index={i}
              feature={i === 0}
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
          <div className="foot-mark">Shine!!</div>
          <div className="foot-sub">Aqours, forever sunshine.</div>
          <p className="foot-note">
            A fan-made tribute celebrating Aqours from Love Live! Sunshine!! Aqours, its
            characters, and music are the property of their respective rights holders. Made
            with love, by the sea.
          </p>
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
