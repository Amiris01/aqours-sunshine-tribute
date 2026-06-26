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
