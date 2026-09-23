import { render } from '@testing-library/react'
import { vi } from 'vitest'

const created: unknown[] = []
vi.mock('lenis', () => ({
  default: class {
    constructor(opts: unknown) { created.push(opts) }
    destroy() {}
  },
}))
const { SmoothScroll } = await import('./SmoothScroll')

it('glides menu jumps below the fixed top bar with an eased, deliberate scroll', () => {
  render(<SmoothScroll />)
  const opts = created.at(-1) as { anchors: { offset: number; duration: number; easing: (t: number) => number } }
  expect(opts.anchors.offset).toBe(-64)
  expect(opts.anchors.duration).toBeGreaterThanOrEqual(1)
  expect(opts.anchors.easing(0)).toBe(0)
  expect(opts.anchors.easing(1)).toBeCloseTo(1)
})
