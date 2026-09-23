import { getLenis } from './lenis'

type GsapBundle = {
  gsap: typeof import('gsap').gsap
  ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger
}

let promise: Promise<GsapBundle> | null = null

/** Lazy-load GSAP + ScrollTrigger once (never called under reduced motion). */
export function loadGsap(): Promise<GsapBundle> {
  promise ??= Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([g, st]) => {
    g.gsap.registerPlugin(st.ScrollTrigger)
    getLenis()?.on('scroll', st.ScrollTrigger.update)
    return { gsap: g.gsap, ScrollTrigger: st.ScrollTrigger }
  })
  return promise
}
