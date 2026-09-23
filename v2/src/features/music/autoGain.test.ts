import { createAutoGain } from './spectrum'

const flat = (v: number) => Array.from({ length: 64 }, () => v)

it('lifts a quiet signal so it fills the strip after a moment', () => {
  const gain = createAutoGain()
  let out: number[] = []
  for (let f = 0; f < 90; f++) out = gain(flat(0.2), 1 / 60) // ~1.5 s of quiet music
  expect(Math.max(...out)).toBeGreaterThan(0.6)
  expect(Math.max(...out)).toBeLessThanOrEqual(1)
})

it('boosts treble relative to bass for the same raw level', () => {
  const gain = createAutoGain()
  let out: number[] = []
  for (let f = 0; f < 30; f++) out = gain(flat(0.3), 1 / 60)
  expect(out[60]!).toBeGreaterThan(out[2]!)
})

it('keeps silence silent (no amplified noise floor)', () => {
  const gain = createAutoGain()
  let out: number[] = []
  for (let f = 0; f < 60; f++) out = gain(flat(0.01), 1 / 60)
  expect(Math.max(...out)).toBeLessThan(0.08)
})

it('does not overshoot a loud signal', () => {
  const gain = createAutoGain()
  let out: number[] = []
  for (let f = 0; f < 60; f++) out = gain(flat(0.95), 1 / 60)
  expect(Math.max(...out)).toBeLessThanOrEqual(1)
  expect(Math.min(...out)).toBeGreaterThan(0.7)
})
