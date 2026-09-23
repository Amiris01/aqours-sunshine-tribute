import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { usePlayer } from '../../store/player'
import { useLang } from '../../store/lang'

vi.mock('./spotifyBridge', () => ({ startSpotify: vi.fn(() => Promise.resolve()) }))
const { startSpotify } = await import('./spotifyBridge')
const { Player } = await import('./Player')

beforeEach(() => {
  useLang.getState().setLang('en')
  usePlayer.getState().close()
  vi.mocked(startSpotify).mockClear()
})

it('renders nothing visible while closed', () => {
  render(<Player />)
  expect(screen.queryByRole('region', { name: 'Music player' })).not.toBeInTheDocument()
})

it('starts Spotify lazily on first play and shows the track', () => {
  render(<Player />)
  expect(startSpotify).not.toHaveBeenCalled()
  usePlayer.getState().playAt(1)
  return screen.findByRole('region', { name: 'Music player' }).then((region) => {
    expect(region).toHaveTextContent('Aozora Jumping Heart')
    expect(startSpotify).toHaveBeenCalledTimes(1)
  })
})

it('shows an Open in Spotify fallback and retries on error', async () => {
  render(<Player />)
  usePlayer.getState().playAt(0)
  usePlayer.getState().fail()
  const link = await screen.findByRole('link', { name: 'Open in Spotify' })
  expect(link).toHaveAttribute('href', 'https://open.spotify.com/album/32Tz0vbR5XjgoIaRjgbIeN')
  await userEvent.click(screen.getByRole('button', { name: 'Retry' }))
  expect(startSpotify).toHaveBeenCalledTimes(2)
  expect(usePlayer.getState().status).toBe('loading')
})

it('closes', async () => {
  render(<Player />)
  usePlayer.getState().playAt(0)
  await userEvent.click(await screen.findByRole('button', { name: 'Close player' }))
  expect(usePlayer.getState().index).toBe(-1)
})
