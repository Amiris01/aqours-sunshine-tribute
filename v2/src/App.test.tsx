import { act, render, screen } from '@testing-library/react'
import App from './App'
import { useLang } from './store/lang'
import { usePlayer } from './store/player'

it('renders the shell and syncs the document title with the language', () => {
  useLang.getState().setLang('en')
  render(<App />)
  expect(screen.getByRole('main')).toBeInTheDocument()
  expect(screen.getByRole('contentinfo')).toHaveTextContent('fan-made tribute')
  expect(document.title).toBe('Aqours — Love Live! Sunshine!! Fan Tribute')
})

it('has a live region mounted before playback so the first track is announced', () => {
  useLang.getState().setLang('en')
  usePlayer.getState().close()
  render(<App />)
  const live = screen.getByTestId('np-announcer')
  expect(live).toHaveAttribute('aria-live', 'polite')
  expect(live).toHaveTextContent('')
  act(() => usePlayer.getState().playAt(1))
  expect(live).toHaveTextContent('Now playing: Aozora Jumping Heart')
  act(() => usePlayer.getState().close())
})

it('opens a member from her hero penlight and returns focus to it on close', async () => {
  const { default: userEvent } = await import('@testing-library/user-event')
  const { waitFor, within } = await import('@testing-library/react')
  useLang.getState().setLang('en')
  render(<App />)
  const penlight = screen.getByRole('button', { name: 'Ruby: open profile' })
  await userEvent.click(penlight)
  const dialog = await screen.findByRole('dialog')
  expect(within(dialog).getByRole('heading', { name: 'Ruby Kurosawa' })).toBeInTheDocument()
  await userEvent.keyboard('{Escape}')
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  await waitFor(() => expect(penlight).toHaveFocus())
})
