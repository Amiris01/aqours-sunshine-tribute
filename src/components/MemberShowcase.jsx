import { useEffect, useRef } from 'react'
import MemberSection from './MemberSection'
import { useGsap, prefersReducedMotion } from '../anim/useGsap'
import { DESKTOP_QUERY, MOBILE_QUERY } from '../anim/gsapReveal'
import { useLang } from '../i18n/LanguageContext'

/**
 * The nine member bands as a presentation.
 *  - Desktop (>=900px, motion ok): the stage pins and a scrubbed timeline
 *    crossfades + zooms from one member to the next (slideshow).
 *  - Mobile (<900px, motion ok): normal flow; each member reveals on entry.
 *  - Reduced motion: normal flow, all visible, no GSAP.
 */
export default function MemberShowcase({ members }) {
  const { gsap, ScrollTrigger, ready } = useGsap()
  const { lang, switching } = useLang()
  const stageRef = useRef(null)
  const reduce = prefersReducedMotion()

  // Language changes swap text lengths and the JP font, which alter element
  // heights AFTER ScrollTrigger measured the pin — leaving the pin span stale.
  // Re-measure once the crossfade settles so the pin geometry stays correct.
  useEffect(() => {
    if (reduce || !ready || !ScrollTrigger) return
    if (switching) return
    const id = setTimeout(() => ScrollTrigger.refresh(), 60)
    return () => clearTimeout(id)
  }, [lang, switching, reduce, ready, ScrollTrigger])

  useEffect(() => {
    if (reduce || !ready || !gsap || !ScrollTrigger) return
    const stage = stageRef.current
    if (!stage) return
    const slides = Array.from(stage.querySelectorAll('.showcase-slide'))
    if (!slides.length) return

    const mm = gsap.matchMedia()

    // ---- Desktop: pinned crossfade slideshow ----
    mm.add(DESKTOP_QUERY, () => {
      // All slides stacked; only the first visible at rest.
      gsap.set(slides, { position: 'absolute', inset: 0, autoAlpha: 0 })
      gsap.set(slides[0], { autoAlpha: 1 })

      const perSlide = 0.5 // viewport-heights of scroll budget per member (shorter = snappier)
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: stage,
          start: 'top top',
          end: () => `+=${window.innerHeight * perSlide * slides.length}`,
          scrub: 0.8,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })

      slides.forEach((slide, i) => {
        if (i === 0) return
        const prev = slides[i - 1]
        const banner = slide.querySelector('.msec-banner')
        const info = slide.querySelector('.minfo')
        const sign = slide.querySelector('.m-sign')
        const cardRight = slide.classList.contains('card-right')
        const dir = cardRight ? 80 : -80
        const prevBanner = prev.querySelector('.msec-banner')

        // Outgoing prev: zoom + fade.
        tl.to(prev, { autoAlpha: 0, duration: 0.5 }, i)
        if (prevBanner) tl.to(prevBanner, { scale: 1.1, duration: 0.6 }, i)
        // Incoming: fade up, banner settles from slight zoom, card slides in.
        tl.fromTo(slide, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, i + 0.15)
        if (banner) tl.fromTo(banner, { scale: 1.1 }, { scale: 1, duration: 0.7 }, i + 0.15)
        if (info) tl.fromTo(info, { x: dir, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.5 }, i + 0.2)
        // Fade the signature only (no transform) — the CSS rotate tilt on
        // .m-sign must survive; animating y here would clobber it.
        if (sign) tl.fromTo(sign, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, i + 0.35)
      })

      return () => {
        // matchMedia revert restores inline styles set above.
        gsap.set(slides, { clearProps: 'all' })
      }
    })

    // ---- Mobile: enter-once reveal per member, normal flow ----
    mm.add(MOBILE_QUERY, () => {
      const tweens = slides.map((slide) => {
        const banner = slide.querySelector('.msec-banner')
        const info = slide.querySelector('.minfo')
        const cardRight = slide.classList.contains('card-right')
        const dir = cardRight ? 60 : -60
        const tl = gsap.timeline({
          scrollTrigger: { trigger: slide, start: 'top 78%', toggleActions: 'play none none none' },
        })
        tl.fromTo(slide, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, 0)
        if (banner) tl.fromTo(banner, { scale: 1.08 }, { scale: 1, duration: 0.9 }, 0)
        if (info) tl.fromTo(info, { x: dir, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.6 }, 0.1)
        return tl
      })
      return () => tweens.forEach((t) => { if (t.scrollTrigger) t.scrollTrigger.kill(); t.kill() })
    })

    // Re-measure after banner images / fonts settle.
    const refresh = () => ScrollTrigger.refresh()
    window.addEventListener('load', refresh)
    const tid = setTimeout(refresh, 600)

    return () => {
      window.removeEventListener('load', refresh)
      clearTimeout(tid)
      mm.revert()
    }
  }, [reduce, ready, gsap, ScrollTrigger])

  return (
    <div className="member-showcase" ref={stageRef}>
      {members.map((m, i) => (
        <MemberSection key={m.num} m={m} idx={i} showcase />
      ))}
    </div>
  )
}
