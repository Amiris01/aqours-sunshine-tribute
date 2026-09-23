import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../../lib/motionPref'
import type { Status } from '../../store/player'

/**
 * The "penlight equaliser" along the top of the player.
 *
 * The audio plays inside Spotify's cross-origin embed, so the page cannot read it:
 * this is driven by playback state, not audio analysis. Bars wave while playing
 * (a per-song pattern that builds slightly through the track), ease down to rest
 * when paused, and a glow sweeps across while loading. Decorative only.
 */

const BARS = 48
const REST = 0.12

type VizState = 'playing' | 'resting' | 'loading' | 'static'

function stateFor(status: Status, reduced: boolean): VizState {
  if (reduced) return 'static'
  if (status === 'playing') return 'playing'
  if (status === 'loading') return 'loading'
  return 'resting'
}

/** Stable per-song phase offsets so each track has its own wave. */
function seedPhases(seed: string) {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619)
  const phases: number[] = []
  for (let i = 0; i < BARS; i++) {
    h = Math.imul(h ^ (h >>> 13), 1274126177)
    phases.push(((h >>> 0) % 1000) / 1000 * Math.PI * 2)
  }
  return phases
}

interface Props {
  color: string
  status: Status
  seed: string
  /** 0..1 through the current track. */
  progress: number
}

export function Visualizer({ color, status, seed, progress }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced = prefersReducedMotion()
  const state = stateFor(status, reduced)

  // Live values read by the animation loop without restarting it.
  const live = useRef({ state, color, progress, phases: seedPhases(seed) })
  live.current.state = state
  live.current.color = color
  live.current.progress = progress
  useEffect(() => {
    live.current.phases = seedPhases(seed)
  }, [seed])

  const heights = useRef<number[]>(Array.from({ length: BARS }, () => REST))
  const raf = useRef<number | null>(null)
  const kickRef = useRef<() => void>(() => {})

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(canvas.clientWidth * dpr)
      canvas.height = Math.round(canvas.clientHeight * dpr)
    }
    size()
    const ro = new ResizeObserver(size)
    ro.observe(canvas)

    let t = 0
    let last = performance.now()

    const draw = () => {
      const { width: w, height: h } = canvas
      const { state: s, color: c } = live.current
      ctx.clearRect(0, 0, w, h)
      const gap = w / BARS
      const barW = Math.max(1, gap * 0.45)
      ctx.fillStyle = c
      ctx.shadowColor = c
      ctx.shadowBlur = Math.round(h * 0.35)
      const sweep = s === 'loading' ? ((t * 0.6) % 1.4) - 0.2 : -1
      for (let i = 0; i < BARS; i++) {
        let v = heights.current[i]!
        if (s === 'static') v = 0.18 + 0.12 * Math.abs(Math.sin(i * 0.7))
        if (s === 'loading') v = Math.max(REST, 0.8 * Math.exp(-(((i / BARS) - sweep) ** 2) / 0.004))
        const bh = Math.max(1.5, v * h)
        ctx.globalAlpha = 0.45 + v * 0.55
        ctx.fillRect(i * gap + (gap - barW) / 2, h - bh, barW, bh)
      }
      ctx.globalAlpha = 1
    }

    const step = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      t += dt
      const { state: s, progress: p, phases } = live.current
      let settled = true
      if (s === 'playing' || s === 'resting') {
        // Energy builds a little through the track.
        const energy = 0.55 + 0.35 * Math.min(1, Math.max(0, p))
        const speed = 2.2 + p * 1.2
        for (let i = 0; i < BARS; i++) {
          const ph = phases[i]!
          const target =
            s === 'playing'
              ? Math.min(1, REST + 1.3 * energy * (0.5 + 0.28 * Math.sin(t * speed + ph) + 0.22 * Math.sin(t * speed * 1.9 + i * 0.35 + ph * 0.5)) * (0.55 + 0.45 * Math.sin(i * 0.21 + t * 0.7) ** 2))
              : REST
          const cur = heights.current[i]!
          const next = cur + (target - cur) * Math.min(1, dt * (s === 'playing' ? 10 : 5))
          heights.current[i] = next
          if (Math.abs(next - target) > 0.004) settled = false
        }
      }
      draw()
      // Keep animating while playing/loading; after a pause, only until the bars have settled.
      const keepGoing = !document.hidden && (s === 'playing' || s === 'loading' || !settled)
      raf.current = keepGoing ? requestAnimationFrame(step) : null
    }

    const kick = () => {
      if (raf.current === null && !document.hidden && live.current.state !== 'static') {
        last = performance.now()
        raf.current = requestAnimationFrame(step)
      }
    }
    draw()
    kick()
    const onVis = () => kick()
    document.addEventListener('visibilitychange', onVis)
    kickRef.current = kick
    return () => {
      ro.disconnect()
      document.removeEventListener('visibilitychange', onVis)
      if (raf.current !== null) cancelAnimationFrame(raf.current)
      raf.current = null
    }
  }, [])

  // Restart the loop whenever the state changes (e.g. paused → playing).
  useEffect(() => {
    kickRef.current()
  }, [state])

  return (
    <canvas
      ref={canvasRef}
      data-testid="visualizer"
      data-state={state}
      data-color={color}
      aria-hidden="true"
      className="block h-full w-full"
    />
  )
}
