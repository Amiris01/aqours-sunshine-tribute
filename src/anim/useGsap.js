import { useEffect, useState } from 'react'

// Module-level cache so GSAP + ScrollTrigger load and register exactly once,
// no matter how many components ask for them.
let cached = null
let loadPromise = null

export function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

function loadGsap() {
  if (cached) return Promise.resolve(cached)
  if (loadPromise) return loadPromise
  loadPromise = Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger'),
  ]).then(([gsapMod, stMod]) => {
    const gsap = gsapMod.gsap || gsapMod.default
    const ScrollTrigger = stMod.ScrollTrigger || stMod.default
    gsap.registerPlugin(ScrollTrigger)
    cached = { gsap, ScrollTrigger }
    return cached
  })
  return loadPromise
}

/**
 * Lazy-loads GSAP + ScrollTrigger on mount UNLESS the user prefers reduced
 * motion (then it never loads). Returns nulls until ready.
 */
export function useGsap() {
  const [state, setState] = useState(
    cached ? { ...cached, ready: true } : { gsap: null, ScrollTrigger: null, ready: false }
  )

  useEffect(() => {
    if (prefersReducedMotion()) return // never load GSAP under reduced motion
    if (cached) {
      setState({ ...cached, ready: true })
      return
    }
    let alive = true
    loadGsap().then((mods) => {
      if (alive) setState({ ...mods, ready: true })
    })
    return () => {
      alive = false
    }
  }, [])

  return state
}
