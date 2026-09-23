import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TopBar } from './TopBar'
import { usePlayer } from '../../store/player'
import { useLang } from '../../store/lang'

beforeEach(() => {
  useLang.getState().setLang('en')
  usePlayer.getState().close()
})

it('links to every section', () => {
  render(<TopBar />)
  for (const [name, href] of [['Members', '#members'], ['Units', '#units'], ['Setlist', '#music'], ['Timeline', '#journey']]) {
    expect(screen.getByRole('link', { name })).toHaveAttribute('href', href)
  }
})

it('shows a now-playing pill that restores a minimized player', async () => {
  render(<TopBar />)
  expect(screen.queryByRole('button', { name: /Show player/ })).not.toBeInTheDocument()
  usePlayer.getState().playAt(0)
  usePlayer.getState().setMinimized(true)
  await userEvent.click(await screen.findByRole('button', { name: /Show player/ }))
  expect(usePlayer.getState().minimized).toBe(false)
})

it('shows a tiny equaliser in the pill while music plays', async () => {
  const { act } = await import('@testing-library/react')
  render(<TopBar />)
  act(() => {
    usePlayer.getState().playAt(0)
    usePlayer.getState().setMinimized(true)
    usePlayer.getState().report({ position: 2, duration: 90, paused: false, buffering: false })
  })
  const pill = screen.getByRole('button', { name: /Show player/ })
  expect(pill.querySelector('[data-testid="pill-eq"]')).not.toBeNull()
  act(() => usePlayer.getState().report({ position: 2, duration: 90, paused: true, buffering: false }))
  expect(pill.querySelector('[data-testid="pill-eq"]')?.getAttribute('data-playing')).toBe('false')
})
