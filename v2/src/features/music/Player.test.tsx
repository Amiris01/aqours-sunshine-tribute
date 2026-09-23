import { render, screen, waitFor, within } from '@testing-library/react'
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

it('moves focus to the top-bar pill on minimize and back to the trigger on close', async () => {
  const { TopBar } = await import('../layout/TopBar')
  render(
    <>
      <TopBar />
      <button type="button" onClick={() => usePlayer.getState().playAt(0)}>trigger</button>
      <Player />
    </>,
  )
  const trigger = screen.getByRole('button', { name: 'trigger' })
  await userEvent.click(trigger)
  await userEvent.click(await screen.findByRole('button', { name: 'Minimize player' }))
  await waitFor(() => expect(screen.getByRole('button', { name: /Show player/ })).toHaveFocus())
  await userEvent.click(screen.getByRole('button', { name: /Show player/ }))
  await userEvent.click(await screen.findByRole('button', { name: 'Close player' }))
  await waitFor(() => expect(trigger).toHaveFocus())
})

it('keeps the Spotify embed host in the viewport with real size (a zero-size/offscreen embed never fires ready)', () => {
  render(<Player />)
  const host = screen.getByTestId('spotify-host')
  expect(host.style.position).toBe('fixed')
  expect(host.style.height).toBe('80px')
  expect(host.style.width).not.toBe('0px')
  expect(host.style.opacity).toBe('0')
  expect(host.style.pointerEvents).toBe('none')
  expect(host.style.left).not.toMatch(/^-/)
})

it('crowns the docked player with the penlight equaliser', async () => {
  render(<Player />)
  usePlayer.getState().playAt(1)
  const region = await screen.findByRole('region', { name: 'Music player' })
  expect(within(region).getByTestId('visualizer')).toHaveAttribute('data-state', 'loading')
})

describe('Live spectrum button', () => {
  it('appears where tab audio can be captured and starts a capture', async () => {
    const { useLiveSpectrum } = await import('../../store/liveSpectrum')
    const start = vi.fn()
    useLiveSpectrum.setState({ supported: true, status: 'off', start })
    render(<Player />)
    usePlayer.getState().playAt(0)
    await userEvent.click(await screen.findByRole('button', { name: 'Live spectrum' }))
    expect(start).toHaveBeenCalled()
  })

  it('is hidden where the browser cannot capture tab audio', async () => {
    const { useLiveSpectrum } = await import('../../store/liveSpectrum')
    useLiveSpectrum.setState({ supported: false, status: 'off' })
    render(<Player />)
    usePlayer.getState().playAt(0)
    await screen.findByRole('region', { name: 'Music player' })
    expect(screen.queryByRole('button', { name: 'Live spectrum' })).not.toBeInTheDocument()
  })

  it('explains a declined prompt', async () => {
    const { useLiveSpectrum } = await import('../../store/liveSpectrum')
    useLiveSpectrum.setState({ supported: true, status: 'denied' })
    render(<Player />)
    usePlayer.getState().playAt(0)
    expect(await screen.findByText(/This tab/)).toBeInTheDocument()
  })
})

it('explains the share prompt while it is open: sound only, nothing recorded', async () => {
  const { useLiveSpectrum } = await import('../../store/liveSpectrum')
  useLiveSpectrum.setState({ supported: true, status: 'starting' })
  render(<Player />)
  usePlayer.getState().playAt(0)
  expect(await screen.findByText(/nothing is recorded/)).toBeInTheDocument()
})
