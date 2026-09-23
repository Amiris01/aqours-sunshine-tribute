import { vi } from 'vitest'
import { hasWebGL } from './webgl'

it('releases the probe context after detecting WebGL', () => {
  const loseContext = vi.fn()
  const ctx = { getExtension: (name: string) => (name === 'WEBGL_lose_context' ? { loseContext } : null) }
  const spy = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx as unknown as RenderingContext)
  expect(hasWebGL()).toBe(true)
  expect(loseContext).toHaveBeenCalledTimes(1)
  spy.mockRestore()
})

it('returns false without WebGL', () => {
  const spy = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
  expect(hasWebGL()).toBe(false)
  spy.mockRestore()
})
