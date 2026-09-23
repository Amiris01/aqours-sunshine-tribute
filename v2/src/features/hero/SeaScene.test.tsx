import { render } from '@testing-library/react'
import { useEffect } from 'react'
import { vi } from 'vitest'

// R3F can't render in jsdom; stand in a Canvas that hands onCreated a fake renderer
// whose domElement is a real canvas we can fire context events on.
const canvasEl = document.createElement('canvas')
vi.mock('@react-three/fiber', () => ({
  useFrame: () => {},
  Canvas: ({ onCreated }: { onCreated: (s: { gl: unknown }) => void }) => {
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
