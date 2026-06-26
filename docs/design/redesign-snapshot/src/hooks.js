import { useEffect, useRef, useState } from 'react'

// Reusable scroll-reveal: returns [ref, shown]. `shown` flips true the first
// time the element enters the viewport. Respects reduced-motion (the CSS makes
// .reveal visible immediately, so this just gates the transition).
export function useReveal(options = { rootMargin: '0px 0px -12% 0px', threshold: 0.12 }) {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || shown) return
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          setShown(true)
          io.disconnect()
        }
      })
    }, options)
    io.observe(el)
    return () => io.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown])
  return [ref, shown]
}

// Count from 0 → target over `duration` ms once `start` becomes true.
export function useCountUp(target, start, duration = 1100) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!start) return
    const reduce =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setVal(target)
      return
    }
    let raf = 0
    const t0 = performance.now()
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(eased * target))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [start, target, duration])
  return val
}
