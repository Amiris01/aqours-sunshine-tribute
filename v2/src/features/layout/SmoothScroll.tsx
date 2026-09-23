import { useEffect } from 'react'
import { useReducedMotion } from 'motion/react'
import Lenis from 'lenis'
import { setLenis } from '../../motion/lenis'
import { easeOutExpo } from '../../motion/tokens'

export function SmoothScroll() {
  const reduce = useReducedMotion()
  useEffect(() => {
    if (reduce) return
    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.085,
      // Menu jumps glide to just below the fixed top bar (h-14 + breathing room).
      anchors: { offset: -64, duration: 1.3, easing: easeOutExpo },
    })
    setLenis(lenis)
    return () => {
      lenis.destroy()
      setLenis(null)
    }
  }, [reduce])
  return null
}
