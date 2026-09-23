import { act, render } from '@testing-library/react'
import { useEffect } from 'react'
import { vi } from 'vitest'

// R3F can't render in jsdom; stand in a Canvas that hands onCreated a fake renderer
// whose domElement is a real canvas we can fire context events on, and records its props.
const canvasEl = document.createElement('canvas')
const seen: { frameloop?: string } = {}
vi.mock('@react-three/fiber', () => ({
  useFrame: () => {},
  useThree: () => ({ camera: { position: { x: 0, y: 0 }, rotation: { set: () => {} } } }),
  Canvas: ({ onCreated, frameloop }: { onCreated: (s: { gl: unknown }) => void; frameloop?: string }) => {
    seen.frameloop = frameloop
    useEffect(() => {
      onCreated({ gl: { setClearColor: () => {}, domElement: canvasEl } })
    }, [onCreated])
    return null
  },
}))
const { default: SeaScene } = await import('./SeaScene')

it('reports a real context loss while mounted', () => {
  const onFail = vi.fn()
  const { unmount } = render(<SeaScene onFail={onFail} />)
  canvasEl.dispatchEvent(new Event('webglcontextlost', { cancelable: true }))
  expect(onFail).toHaveBeenCalledTimes(1)
  unmount()
})

it('ignores the context loss R3F triggers when unmounting (scrolling away)', () => {
  const onFail = vi.fn()
  const { unmount } = render(<SeaScene onFail={onFail} />)
  unmount()
  canvasEl.dispatchEvent(new Event('webglcontextlost', { cancelable: true }))
  expect(onFail).not.toHaveBeenCalled()
})

it('stops rendering frames while the tab is hidden and resumes when visible', () => {
  const hidden = vi.spyOn(document, 'hidden', 'get')
  hidden.mockReturnValue(false)
  render(<SeaScene onFail={() => {}} />)
  expect(seen.frameloop).toBe('always')
  hidden.mockReturnValue(true)
  act(() => {
    document.dispatchEvent(new Event('visibilitychange'))
  })
  expect(seen.frameloop).toBe('never')
  hidden.mockReturnValue(false)
  act(() => {
    document.dispatchEvent(new Event('visibilitychange'))
  })
  expect(seen.frameloop).toBe('always')
  hidden.mockRestore()
})
