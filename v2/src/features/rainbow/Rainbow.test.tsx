import { act, render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { Rainbow } from './Rainbow'
import { useLang } from '../../store/lang'

beforeEach(() => useLang.getState().setLang('en'))

it('stays dark until the crowd scrolls into view, then lights the rainbow', () => {
  let fire: (e: { isIntersecting: boolean }[]) => void = () => {}
  const Original = globalThis.IntersectionObserver
  globalThis.IntersectionObserver = class {
    constructor(cb: (e: { isIntersecting: boolean }[]) => void) { fire = cb }
    observe() {}
    disconnect() {}
  } as unknown as typeof IntersectionObserver
  try {
    render(<Rainbow />)
    const crowd = screen.getByTestId('rainbow-crowd')
    expect(crowd).toHaveAttribute('data-lit', 'false')
    expect(crowd.querySelectorAll('[data-light]').length).toBeGreaterThan(150)
    act(() => fire([{ isIntersecting: true }]))
    expect(crowd).toHaveAttribute('data-lit', 'true')
  } finally {
    globalThis.IntersectionObserver = Original
  }
})

it('is already lit under reduced motion, with a factual caption', () => {
  const original = window.matchMedia
  window.matchMedia = ((q: string) => ({ ...original(q), matches: q.includes('reduce') })) as typeof window.matchMedia
  try {
    render(<Rainbow />)
    expect(screen.getByTestId('rainbow-crowd')).toHaveAttribute('data-lit', 'true')
    expect(screen.getByText(/Finale LoveLive!/)).toBeInTheDocument()
  } finally {
    window.matchMedia = original
  }
  vi.restoreAllMocks()
})
