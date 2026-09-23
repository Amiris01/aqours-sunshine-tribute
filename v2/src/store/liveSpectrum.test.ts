import { vi } from 'vitest'
import { createLiveSpectrum } from './liveSpectrum'

function fakeTrack(kind: 'audio' | 'video') {
  const listeners: Record<string, () => void> = {}
  return {
    kind,
    stop: vi.fn(),
    addEventListener: (ev: string, cb: () => void) => {
      listeners[ev] = cb
    },
    end: () => listeners.ended?.(),
  }
}
function fakeStream(tracks: ReturnType<typeof fakeTrack>[]) {
  return {
    getTracks: () => tracks,
    getAudioTracks: () => tracks.filter((t) => t.kind === 'audio'),
    getVideoTracks: () => tracks.filter((t) => t.kind === 'video'),
  } as unknown as MediaStream
}
const fakeAudio = () => ({
  analyser: { fftSize: 2048 } as AnalyserNode,
  close: vi.fn(),
})

it("requests this tab's audio and goes live, keeping only the sound", async () => {
  const audio = fakeTrack('audio')
  const video = fakeTrack('video')
  const getDisplayMedia = vi.fn().mockResolvedValue(fakeStream([audio, video]))
  const store = createLiveSpectrum({ getDisplayMedia, connect: () => fakeAudio() })
  await store.getState().start()
  expect(getDisplayMedia).toHaveBeenCalledWith(expect.objectContaining({ audio: expect.anything() }))
  expect(store.getState().status).toBe('live')
  expect(store.getState().analyser).not.toBeNull()
  expect(video.stop).toHaveBeenCalled()
})

it('falls back when the prompt is declined', async () => {
  const err = Object.assign(new Error('denied'), { name: 'NotAllowedError' })
  const store = createLiveSpectrum({ getDisplayMedia: vi.fn().mockRejectedValue(err), connect: () => fakeAudio() })
  await store.getState().start()
  expect(store.getState()).toMatchObject({ status: 'denied', analyser: null })
})

it('explains when the share had no audio, and stops the tracks', async () => {
  const video = fakeTrack('video')
  const store = createLiveSpectrum({ getDisplayMedia: vi.fn().mockResolvedValue(fakeStream([video])), connect: () => fakeAudio() })
  await store.getState().start()
  expect(store.getState().status).toBe('noaudio')
  expect(video.stop).toHaveBeenCalled()
})

it('returns to standard mode when the share ends or is stopped', async () => {
  const audio = fakeTrack('audio')
  const a = fakeAudio()
  const store = createLiveSpectrum({ getDisplayMedia: vi.fn().mockResolvedValue(fakeStream([audio])), connect: () => a })
  await store.getState().start()
  audio.end()
  expect(store.getState()).toMatchObject({ status: 'off', analyser: null })
  expect(a.close).toHaveBeenCalled()
  await store.getState().start()
  store.getState().stop()
  expect(store.getState().status).toBe('off')
  expect(audio.stop).toHaveBeenCalled()
})

it('knows when the browser cannot capture tab audio', () => {
  const store = createLiveSpectrum({ getDisplayMedia: undefined, connect: () => fakeAudio() })
  expect(store.getState().supported).toBe(false)
})
