export const DESKTOP_QUERY = '(min-width: 900px)'
export const MOBILE_QUERY = '(max-width: 899px)'

/**
 * Reveal `el` (and optional staggered `children`) on scroll-in using GSAP.
 * Returns a cleanup fn. Animates transform+opacity only.
 */
export function gsapReveal(gsap, ScrollTrigger, el, opts = {}) {
  if (!el) return () => {}
  const {
    children = null,
    y = 40,
    stagger = 0.08,
    start = 'top 82%',
    scrub = false,
  } = opts

  const targets = children && children.length ? children : el
  const tween = gsap.fromTo(
    targets,
    { autoAlpha: 0, y, scale: 0.985 },
    {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      duration: 0.9,
      ease: 'power3.out',
      stagger: children && children.length ? stagger : 0,
      scrollTrigger: {
        trigger: el,
        start,
        end: scrub ? 'top 40%' : undefined,
        scrub: scrub ? 0.6 : false,
        toggleActions: scrub ? undefined : 'play none none none',
      },
    }
  )

  return () => {
    if (tween.scrollTrigger) tween.scrollTrigger.kill()
    tween.kill()
  }
}
