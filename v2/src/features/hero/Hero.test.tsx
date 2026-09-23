import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { usePlayer } from '../../store/player'
import { useLang } from '../../store/lang'

vi.mock('../../lib/webgl', () => ({ hasWebGL: () => false }))
const { Hero } = await import('./Hero')

beforeEach(() => {
  useLang.getState().setLang('en')
  usePlayer.getState().close()
})

it('shows the logo heading, tagline and fallback scene without WebGL', () => {
  render(<Hero />)
  expect(screen.getByRole('heading', { level: 1, name: 'Aqours' })).toBeInTheDocument()
  expect(screen.getByText('Shine with us — here, now, by the sea.')).toBeInTheDocument()
  expect(screen.getByTestId('hero-fallback')).toBeInTheDocument()
})

it('Play Aqours starts the queue from the first release', async () => {
  render(<Hero />)
  await userEvent.click(screen.getByRole('button', { name: 'Play from M01' }))
  expect(usePlayer.getState().index).toBe(0)
})
