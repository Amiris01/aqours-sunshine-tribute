import { useEffect, useRef, useState } from 'react'

/**
 * Reveal-on-scroll. Returns a ref + boolean. When ~16% of the element enters
 * the viewport it flips to true (once), mirroring the prototype's IO config.
 */
export function useReveal() {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || shown) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setShown(true)
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.16, rootMargin: '0px 0px -7% 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [shown])

  return [ref, shown]
}

/**
 * Counts up from 0 to `target` over `dur` ms with ease-out-cubic, but only
 * once `active` becomes true. Returns the current display value.
 */
export function useCountUp(target, active, dur = 1100) {
  const [val, setVal] = useState(0)
  const ranRef = useRef(false)

  useEffect(() => {
    if (!active || ranRef.current) return
    ranRef.current = true
    const t0 = performance.now()
    let raf
    const step = (now) => {
      const k = Math.min(1, (now - t0) / dur)
      setVal(Math.round(target * (1 - Math.pow(1 - k, 3))))
      if (k < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [active, target, dur])

  return val
}
