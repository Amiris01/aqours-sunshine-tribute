import { beatPulse } from './beat'

it('peaks on each beat and decays before the next one', () => {
  const bpm = 120 // one beat every 0.5s
  expect(beatPulse(0.5, bpm, 0).pulse).toBeCloseTo(1, 2)
  expect(beatPulse(0.75, bpm, 0).pulse).toBeLessThan(0.3)
  expect(beatPulse(0.99, bpm, 0).pulse).toBeLessThan(0.1)
})

it('marks the first beat of every four as the downbeat', () => {
  expect(beatPulse(0, 120, 0).downbeat).toBe(true)
  expect(beatPulse(0.5, 120, 0).downbeat).toBe(false)
  expect(beatPulse(2.0, 120, 0).downbeat).toBe(true)
})

it('respects a per-song first-beat offset', () => {
  expect(beatPulse(0.3, 120, 0.3).pulse).toBeCloseTo(1, 2)
  expect(beatPulse(0.1, 120, 0.3).pulse).toBe(0) // before the first beat: nothing yet
})
