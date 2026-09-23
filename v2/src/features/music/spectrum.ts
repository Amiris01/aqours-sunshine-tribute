const GATE = 0.04 // below this is the noise floor, not music
const TREBLE_BOOST = 0.9 // highs carry far less energy than lows; lift them up to 1.9x
const TARGET = 0.85 // where the loudest band should sit once gain settles
const MAX_GAIN = 3.5
const RELEASE_PER_S = 0.35 // how fast the gain recovers after a loud passage

/**
 * Make live levels fill the strip: gate the noise floor, compensate the natural
 * treble roll-off, then apply automatic gain so quiet songs or low volume still
 * reach near the top. Gain only ever boosts; loud passages are never turned down.
 */
export function createAutoGain() {
  let ref = 0.25
  return (bands: number[], dt: number): number[] => {
    const n = bands.length
    const comp = bands.map((v, i) => (v < GATE ? 0 : v * (1 + (TREBLE_BOOST * i) / Math.max(1, n - 1))))
    const peak = Math.max(...comp)
    ref = peak > ref ? peak : Math.max(0.24, ref - dt * RELEASE_PER_S)
    const gain = Math.min(MAX_GAIN, Math.max(1, TARGET / ref))
    return comp.map((v) => Math.min(1, (v * gain) ** 0.85))
  }
}

const LOW_HZ = 40
const HIGH_HZ = 16000

/**
 * Collapse raw FFT magnitudes (0–255 per bin) into `bands` log-spaced bands,
 * bass on the left to treble on the right, each 0..1 — how a hi-fi analyser
 * spaces them, so the kick, vocals and cymbals each get a fair share of width.
 */
export function toBands(data: Uint8Array, bands: number, sampleRate: number, fftSize: number): number[] {
  const hzPerBin = sampleRate / fftSize
  const maxBin = data.length - 1
  const out: number[] = []
  for (let b = 0; b < bands; b++) {
    const lo = LOW_HZ * (HIGH_HZ / LOW_HZ) ** (b / bands)
    const hi = LOW_HZ * (HIGH_HZ / LOW_HZ) ** ((b + 1) / bands)
    const from = Math.min(maxBin, Math.floor(lo / hzPerBin))
    const to = Math.min(maxBin, Math.max(from, Math.ceil(hi / hzPerBin) - 1))
    let peak = 0
    for (let i = from; i <= to; i++) peak = Math.max(peak, data[i]!)
    out.push(peak / 255)
  }
  return out
}
