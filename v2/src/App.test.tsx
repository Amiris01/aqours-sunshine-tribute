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
