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
