import { useEffect, useMemo, useRef, useState } from 'react'
import { members } from '../../content/members'
import { useT } from '../../i18n'
import { prefersReducedMotion } from '../../lib/motionPref'

// The nine image colours ordered by hue so the bands read as a rainbow.
const ORDER = ['04', '01', '07', '03', '05', '08', '09', '02', '06']
const BANDS = ORDER.map((num) => members.find((m) => m.num === num)!.color)

const W = 1200
const H = 380
const ROWS = 9

interface Light { x: number; y: number; s: number; tilt: number; color: string; delay: number }

/** Deterministic jitter so the crowd looks hand-held but renders the same every time. */
function jitter(n: number) {
  const v = Math.sin(n * 12.9898) * 43758.5453
  return v - Math.floor(v)
}

function crowd(): Light[] {
  const out: Light[] = []
  let n = 0
  for (let r = 0; r < ROWS; r++) {
    const depth = r / (ROWS - 1) // 0 = back of the hall, 1 = front row
    const s = 0.42 + depth * 0.75 // nearer rows are bigger…
    const y = 90 + depth * depth * 250 + depth * 20 // …and spaced further apart
    const span = 0.62 + depth * 0.45 // back rows are narrower (perspective)
    const count = Math.round(26 + depth * 16)
    for (let c = 0; c < count; c++) {
      const u = (c + 0.5 + (jitter(++n) - 0.5) * 0.7) / count // 0..1 across the row
      const x = W / 2 + (u - 0.5) * W * span
      const band = Math.min(BANDS.length - 1, Math.max(0, Math.floor(u * BANDS.length)))
      out.push({
        x,
        y: y + (jitter(n + 7) - 0.5) * 10,
        s,
        tilt: (jitter(n + 13) - 0.5) * 28,
        color: BANDS[band]!,
        delay: Math.round(u * 900 + (ROWS - r) * 30),
      })
    }
  }
  return out
}

/**
 * The finale: a stadium crowd seen from the stage. It lights up in rainbow bands
 * once in view — the "Aqours Rainbow" fans made at the Finale LoveLive!.
 */
export function Rainbow() {
  const t = useT()
  const lights = useMemo(crowd, [])
  const ref = useRef<HTMLDivElement>(null)
  const [reduced] = useState(prefersReducedMotion)
  const [lit, setLit] = useState(reduced)

  useEffect(() => {
    if (lit) return
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => {
      if (e?.isIntersecting) {
        setLit(true)
        io.disconnect()
      }
    }, { threshold: 0.35 })
    io.observe(el)
    return () => io.disconnect()
  }, [lit])

  return (
    <section id="rainbow" className="scroll-mt-20 pb-10 pt-28">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="font-display text-[clamp(2.1rem,5.5vw,4rem)] leading-[1.08]">{t('rainbow.h2')}</h2>
        <p className="mt-6 max-w-[60ch] text-lg leading-relaxed">{t('rainbow.caption')}</p>
      </div>
      <div ref={ref} className="mt-10 overflow-hidden">
        <svg
          data-testid="rainbow-crowd"
          data-lit={lit ? 'true' : 'false'}
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMidYMax slice"
          aria-hidden="true"
          className="block h-[clamp(14rem,32vw,24rem)] w-full"
        >
          <defs>
            {/* Bloom: blurred copy under the sharp lights so they read as light, not paint. */}
            <filter id="rainbow-bloom" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="rainbow-fade" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#07111f" stopOpacity="1" />
              <stop offset="0.35" stopColor="#07111f" stopOpacity="0" />
            </linearGradient>
          </defs>
          <g filter={lit ? 'url(#rainbow-bloom)' : undefined}>
            {lights.map((l, i) => (
              <g key={i} data-light transform={`translate(${l.x.toFixed(1)} ${l.y.toFixed(1)}) rotate(${l.tilt.toFixed(1)}) scale(${l.s.toFixed(3)})`}>
                {/* blade */}
                <line
                  x1="0" y1="0" x2="0" y2="-34"
                  strokeWidth="7"
                  strokeLinecap="round"
                  style={{
                    stroke: lit ? l.color : '#152236',
                    transition: reduced ? undefined : `stroke 500ms ease-out ${l.delay}ms`,
                  }}
                />
                {/* handle */}
                <line x1="0" y1="2" x2="0" y2="16" stroke="#05080d" strokeWidth="6" strokeLinecap="round" />
              </g>
            ))}
          </g>
          <rect width={W} height={H} fill="url(#rainbow-fade)" />
        </svg>
      </div>
    </section>
  )
}
