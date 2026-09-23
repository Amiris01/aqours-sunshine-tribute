import { vi } from 'vitest'
import {
  createSpotifyEngine,
  loadSpotifyApi,
  resetSpotifyApiForTests,
  startSpotify,
  type PlaybackData,
  type PlayerSink,
  type SpotifyController,
  type SpotifyIFrameAPI,
} from './spotifyBridge'

function fakeApi() {
  const listeners: Record<string, (e: { data?: PlaybackData }) => void> = {}
  const controller: SpotifyController = {
    loadUri: vi.fn(),
    play: vi.fn(),
    togglePlay: vi.fn(),
    pause: vi.fn(),
    seek: vi.fn(),
    addListener: (ev, cb) => {
      listeners[ev] = cb
    },
  }
  const api: SpotifyIFrameAPI = { createController: (_el, _opts, cb) => cb(controller) }
  return { api, controller, emit: (ev: string, data?: PlaybackData) => listeners[ev]?.({ data }) }
}

const sink = (): PlayerSink => ({ attachEngine: vi.fn(), report: vi.fn(), ended: vi.fn(), fail: vi.fn() })

it('attaches an engine on ready that drives the controller', () => {
  const { api, controller, emit } = fakeApi()
  const s = sink()
  createSpotifyEngine(api, document.createElement('div'), s, 'spotify:track:A')
  emit('ready')
  const engine = vi.mocked(s.attachEngine).mock.calls[0]![0]
  engine.load('spotify:track:B')
  expect(controller.loadUri).toHaveBeenCalledWith('spotify:track:B')
  expect(controller.play).toHaveBeenCalled()
  engine.seek(12)
  expect(controller.seek).toHaveBeenCalledWith(12)
})

it('converts ms progress to seconds', () => {
  const { api, emit } = fakeApi()
  const s = sink()
  createSpotifyEngine(api, document.createElement('div'), s, 'spotify:track:A')
  emit('playback_update', { position: 3000, duration: 90000, isPaused: false, isBuffering: false })
  expect(s.report).toHaveBeenCalledWith({ position: 3, duration: 90, paused: false, buffering: false })
})

it('fires ended exactly once per track even with repeated end updates', () => {
  const { api, emit } = fakeApi()
  const s = sink()
  createSpotifyEngine(api, document.createElement('div'), s, 'spotify:track:A')
  emit('ready')
  const mid = { position: 30000, duration: 90000, isPaused: false }
  const end = { position: 89800, duration: 90000, isPaused: false }
  emit('playback_update', mid)
  emit('playback_update', end)
  emit('playback_update', end)
  emit('playback_update', end)
  expect(s.ended).toHaveBeenCalledTimes(1)
  vi.mocked(s.attachEngine).mock.calls[0]![0].load('spotify:track:B')
  emit('playback_update', { position: 1000, duration: 120000, isPaused: false })
  emit('playback_update', { position: 119800, duration: 120000, isPaused: false })
  expect(s.ended).toHaveBeenCalledTimes(2)
})

it('does not cascade when the next track loads inside ended and stale end updates follow', () => {
  const { api, emit } = fakeApi()
  const s = sink()
  vi.mocked(s.attachEngine).mockImplementation((engine) => {
    vi.mocked(s.ended).mockImplementation(() => engine.load('spotify:track:NEXT'))
  })
  createSpotifyEngine(api, document.createElement('div'), s, 'spotify:track:A')
  emit('ready')
  emit('playback_update', { position: 30000, duration: 90000, isPaused: false })
  const staleEnd = { position: 89800, duration: 90000, isPaused: false }
  emit('playback_update', staleEnd)
  emit('playback_update', staleEnd)
  emit('playback_update', staleEnd)
  expect(s.ended).toHaveBeenCalledTimes(1)
})

it('fails when the embed never becomes ready', () => {
  vi.useFakeTimers()
  try {
    const { api, emit } = fakeApi()
    const s = sink()
    createSpotifyEngine(api, document.createElement('div'), s, 'spotify:track:A', 5000)
    vi.advanceTimersByTime(5000)
    expect(s.fail).toHaveBeenCalledTimes(1)
    emit('ready')
    expect(s.attachEngine).not.toHaveBeenCalled() // a late ready after failing is ignored
    const ok = sink()
    const second = fakeApi()
    createSpotifyEngine(second.api, document.createElement('div'), ok, 'spotify:track:A', 5000)
    second.emit('ready')
    vi.advanceTimersByTime(5000)
    expect(ok.fail).not.toHaveBeenCalled()
  } finally {
    vi.useRealTimers()
  }
})

describe('loadSpotifyApi', () => {
  beforeEach(() => {
    resetSpotifyApiForTests()
    delete window.SpotifyIframeApi
  })
  afterEach(() => vi.useRealTimers())

  it('rejects on timeout and can be retried', async () => {
    vi.useFakeTimers()
    const first = loadSpotifyApi(1000)
    const assertion = expect(first).rejects.toThrow('timed out')
    vi.advanceTimersByTime(1000)
    await assertion
    const second = loadSpotifyApi(1000)
    expect(second).not.toBe(first)
    const ready = window.onSpotifyIframeApiReady!
    const api = { createController: vi.fn() }
    ready(api)
    await expect(second).resolves.toBe(api)
  })
})

it('drops stale end-of-track updates from the previous track after a load (no status flicker)', () => {
  const { api, emit } = fakeApi()
  const s = sink()
  createSpotifyEngine(api, document.createElement('div'), s, 'spotify:track:A')
  emit('ready')
  emit('playback_update', { position: 30000, duration: 90000, isPaused: false })
  vi.mocked(s.attachEngine).mock.calls[0]![0].load('spotify:track:B')
  vi.mocked(s.report).mockClear()
  emit('playback_update', { position: 89800, duration: 90000, isPaused: false }) // stale, from A
  expect(s.report).not.toHaveBeenCalled()
  emit('playback_update', { position: 0, duration: 120000, isPaused: false }) // B started
  expect(s.report).toHaveBeenCalledWith({ position: 0, duration: 120, paused: false, buffering: false })
})

describe('startSpotify', () => {
  beforeEach(() => {
    resetSpotifyApiForTests()
    delete window.SpotifyIframeApi
  })
  it('reports failure to the player when the API script fails to load', async () => {
    const s = sink()
    const started = startSpotify(document.createElement('div'), s, 'spotify:track:A')
    const tag = [...document.querySelectorAll('script')].at(-1)!
    expect(tag.src).toContain('open.spotify.com/embed/iframe-api')
    tag.dispatchEvent(new Event('error'))
    await started
    expect(s.fail).toHaveBeenCalledTimes(1)
  })
})
