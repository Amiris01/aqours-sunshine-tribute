import { toBands } from './spectrum'

const FFT = 2048
const RATE = 48000
const binFor = (hz: number) => Math.round((hz * FFT) / RATE)

it('maps FFT bins to log-spaced bands, silent in → silent out', () => {
  const data = new Uint8Array(FFT / 2)
  const bands = toBands(data, 64, RATE, FFT)
  expect(bands).toHaveLength(64)
  expect(Math.max(...bands)).toBe(0)
})

it('puts a bass tone on the left and a treble tone on the right', () => {
  const bass = new Uint8Array(FFT / 2)
  bass[binFor(80)] = 255
  const low = toBands(bass, 64, RATE, FFT)
  const treble = new Uint8Array(FFT / 2)
  treble[binFor(8000)] = 255
  const high = toBands(treble, 64, RATE, FFT)
  const peak = (a: number[]) => a.indexOf(Math.max(...a))
  expect(peak(low)).toBeLessThan(16)
  expect(peak(high)).toBeGreaterThan(40)
  expect(Math.max(...low)).toBeGreaterThan(0.5)
})
