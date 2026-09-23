import { render, screen, within } from '@testing-library/react'
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

it('keeps the fallback when playing another release after a failure, and retries on a fresh host', async () => {
  render(<Player />)
  usePlayer.getState().playAt(0)
  usePlayer.getState().fail()
  await screen.findByRole('button', { name: 'Retry' })
  usePlayer.getState().playAt(1)
  const link = await screen.findByRole('link', { name: 'Open in Spotify' })
  expect(link).toHaveAttribute('href', 'https://open.spotify.com/track/3qDPN5KBpu63ieMoommmVm')
  await userEvent.click(screen.getByRole('button', { name: 'Retry' }))
  const calls = vi.mocked(startSpotify).mock.calls
  expect(calls).toHaveLength(2)
  expect(calls[1]![0]).not.toBe(calls[0]![0])
  expect(calls[0]![0].isConnected).toBe(false)
})

it('always offers an Open in Spotify link while playing', async () => {
  render(<Player />)
  usePlayer.getState().playAt(1)
  const region = await screen.findByRole('region', { name: 'Music player' })
  expect(within(region).getByRole('link', { name: 'Open in Spotify' })).toHaveAttribute(
    'href',
    'https://open.spotify.com/track/3qDPN5KBpu63ieMoommmVm',
  )
})

it('closes', async () => {
  render(<Player />)
  usePlayer.getState().playAt(0)
  await userEvent.click(await screen.findByRole('button', { name: 'Close player' }))
  expect(usePlayer.getState().index).toBe(-1)
})
