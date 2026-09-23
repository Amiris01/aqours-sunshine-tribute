import { useEffect } from 'react'
import { useReducedMotion } from 'motion/react'
import Lenis from 'lenis'
import { setLenis } from '../../motion/lenis'

export function SmoothScroll() {
  const reduce = useReducedMotion()
  useEffect(() => {
    if (reduce) return
    const lenis = new Lenis({ autoRaf: true, anchors: true, lerp: 0.1 })
    setLenis(lenis)
    return () => {
      lenis.destroy()
      setLenis(null)
    }
  }, [reduce])
  return null
}
