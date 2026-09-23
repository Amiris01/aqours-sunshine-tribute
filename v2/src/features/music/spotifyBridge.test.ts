import { vi } from 'vitest'
import {
  createSpotifyEngine,
  loadSpotifyApi,
  resetSpotifyApiForTests,
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
  const end = { position: 89800, duration: 90000, isPaused: false }
  emit('playback_update', end)
  emit('playback_update', end)
  emit('playback_update', end)
  expect(s.ended).toHaveBeenCalledTimes(1)
  vi.mocked(s.attachEngine).mock.calls[0]![0].load('spotify:track:B')
  emit('playback_update', end)
  expect(s.ended).toHaveBeenCalledTimes(2)
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
