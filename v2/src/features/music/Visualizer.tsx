import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../../lib/motionPref'
import type { Status } from '../../store/player'
import { beatPulse } from './beat'
import { toBands } from './spectrum'

/**
 * The penlight spectrum along the top of the player: frequency bands from bass
 * (left) to treble (right), with peak caps that hang and fall like hi-fi meters.
 *
 * - live:  the real spectrum, from this tab's audio (see store/liveSpectrum) — the
 *          only way to hear the Spotify embed, which the page otherwise can't read.
 * - beat:  synthesized, when the song's tempo is known: the kick hits the bass bands
 *          on each beat, the snare the mids on 2 and 4, hi-hats shimmer up top.
 * - wave:  synthesized without a tempo: a moving, music-shaped spectrum.
 * Paused → bands fall to rest; loading → a glow sweeps across; reduced motion → static.
 */

const BANDS = 64
const REST = 0.06

type VizState = 'playing' | 'resting' | 'loading' | 'static'

function stateFor(status: Status, reduced: boolean): VizState {
  if (reduced) return 'static'
  if (status === 'playing') return 'playing'
  if (status === 'loading') return 'loading'
  return 'resting'
}

/** Stable per-song phase offsets so each track has its own texture. */
function seedPhases(seed: string) {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619)
  const phases: number[] = []
  for (let i = 0; i < BANDS; i++) {
    h = Math.imul(h ^ (h >>> 13), 1274126177)
    phases.push((((h >>> 0) % 1000) / 1000) * Math.PI * 2)
  }
  return phases
}

/** Rough shape of a pop mix: strong lows, a body in the mids, rolling off up top. */
function tilt(i: number) {
  const x = i / (BANDS - 1)
  return 0.95 - 0.55 * x + 0.18 * Math.exp(-((x - 0.35) ** 2) / 0.02)
}

/** One frame of the synthesized spectrum. */
function synthesize(out: number[], t: number, phases: number[], progress: number, beat?: ReturnType<typeof beatPulse>) {
  const energy = 0.62 + 0.3 * Math.min(1, Math.max(0, progress))
  for (let i = 0; i < BANDS; i++) {
    const x = i / (BANDS - 1)
    const ph = phases[i]!
    // Continuous motion so it never looks frozen between hits.
    let v = tilt(i) * energy * (0.45 + 0.22 * Math.sin(t * 3.1 + ph) + 0.12 * Math.sin(t * 7.3 + ph * 2.1))
    if (beat) {
      const kick = beat.pulse * (beat.downbeat ? 1 : 0.8) * Math.exp(-((x - 0.06) ** 2) / 0.012)
      const snare = beat.beat % 2 === 1 ? beat.pulse * 0.7 * Math.exp(-((x - 0.42) ** 2) / 0.02) : 0
      const hat = Math.abs(Math.sin(t * 9 + ph)) * 0.18 * (x > 0.65 ? 1 : 0)
      v = v * 0.7 + kick * 0.75 + snare + hat
    }
    out[i] = Math.min(1, Math.max(REST, v))
  }
}

interface Props {
  color: string
  status: Status
  seed: string
  /** 0..1 through the current track. */
  progress: number
  /** Playback position in seconds, as last reported by Spotify. */
  position?: number
  /** Song tempo; enables the beat-driven synthesized spectrum. */
  bpm?: number
  /** Seconds before the first beat. */
  beatOffset?: number
  /** Live tab-audio analyser; when present the spectrum is real. */
  analyser?: AnalyserNode | null
}

export function Visualizer({ color, status, seed, progress, position = 0, bpm, beatOffset = 0, analyser = null }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced = prefersReducedMotion()
  const state = stateFor(status, reduced)
  const mode = analyser ? 'live' : bpm ? 'beat' : 'wave'

  // Live values read by the animation loop without restarting it.
  const live = useRef({ state, color, progress, phases: seedPhases(seed), position, positionAt: 0, bpm, beatOffset, analyser })
  const L = live.current
  L.state = state
  L.color = color
  L.progress = progress
  L.bpm = bpm
  L.beatOffset = beatOffset
  L.analyser = analyser
  // Spotify reports position every so often; remember when, to extrapolate between reports.
  if (L.position !== position) {
    L.position = position
    L.positionAt = performance.now()
  }
  useEffect(() => {
    live.current.phases = seedPhases(seed)
  }, [seed])

  const heights = useRef<number[]>(Array.from({ length: BANDS }, () => REST))
  const peaks = useRef<number[]>(Array.from({ length: BANDS }, () => REST))
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

    const target: number[] = Array.from({ length: BANDS }, () => REST)
    let fft: Uint8Array<ArrayBuffer> | null = null
    let t = 0
    let last = performance.now()

    const draw = () => {
      const { width: w, height: h } = canvas
      const { state: s, color: c } = live.current
      ctx.clearRect(0, 0, w, h)
      const gap = w / BANDS
      const barW = Math.max(1, gap * 0.62)
      const cap = Math.max(1.5, h * 0.05)
      const sweep = s === 'loading' ? ((t * 0.6) % 1.4) - 0.2 : -1
      ctx.fillStyle = c
      ctx.shadowColor = c
      ctx.shadowBlur = Math.round(h * 0.3)
      for (let i = 0; i < BANDS; i++) {
        let v = heights.current[i]!
        if (s === 'static') v = tilt(i) * 0.35
        if (s === 'loading') v = Math.max(REST, 0.8 * Math.exp(-((i / BANDS - sweep) ** 2) / 0.004))
        const x = i * gap + (gap - barW) / 2
        const bh = Math.max(1.5, v * (h - cap * 2))
        ctx.globalAlpha = 0.5 + v * 0.5
        ctx.fillRect(x, h - bh, barW, bh)
        // Peak cap: hangs at the recent maximum, then falls.
        if (s === 'playing' || s === 'resting') {
          const py = h - Math.max(bh, peaks.current[i]! * (h - cap * 2)) - cap * 1.6
          ctx.globalAlpha = 0.9
          ctx.fillRect(x, py, barW, cap)
        }
      }
      ctx.globalAlpha = 1
    }

    const step = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      t += dt
      const S = live.current
      let settled = true
      if (S.state === 'playing' || S.state === 'resting') {
        if (S.state === 'playing' && S.analyser) {
          const a = S.analyser
          if (!fft || fft.length !== a.frequencyBinCount) fft = new Uint8Array(a.frequencyBinCount)
          a.getByteFrequencyData(fft)
          const bands = toBands(fft, BANDS, a.context.sampleRate, a.fftSize)
          for (let i = 0; i < BANDS; i++) target[i] = Math.max(REST, bands[i]!)
        } else if (S.state === 'playing') {
          const est = S.position + (now - S.positionAt) / 1000
          synthesize(target, t, S.phases, S.progress, S.bpm ? beatPulse(est, S.bpm, S.beatOffset) : undefined)
        } else {
          target.fill(REST)
        }
        const liveData = S.state === 'playing' && Boolean(S.analyser)
        for (let i = 0; i < BANDS; i++) {
          const cur = heights.current[i]!
          const goal = target[i]!
          // Snap up to hits, fall back more slowly (live data is already smoothed).
          const rate = liveData ? 24 : goal > cur ? 26 : 8
          const next = cur + (goal - cur) * Math.min(1, dt * rate)
          heights.current[i] = next
          const pk = peaks.current[i]!
          peaks.current[i] = next >= pk ? next : Math.max(next, pk - dt * 0.55)
          if (Math.abs(next - goal) > 0.004 || peaks.current[i]! - next > 0.004) settled = false
        }
      }
      draw()
      // Keep animating while playing/loading; after a pause, only until everything has settled.
      const keepGoing = !document.hidden && (S.state === 'playing' || S.state === 'loading' || !settled)
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

  // Restart the loop whenever the state or source changes (e.g. paused → playing, going live).
  useEffect(() => {
    kickRef.current()
  }, [state, mode])

  return (
    <canvas
      ref={canvasRef}
      data-testid="visualizer"
      data-state={state}
      data-mode={mode}
      data-color={color}
      aria-hidden="true"
      className="block h-full w-full"
    />
  )
}
