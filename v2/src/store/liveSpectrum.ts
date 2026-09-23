import { create } from 'zustand'

/**
 * Live spectrum: with the visitor's permission, capture this tab's own sound
 * (including the Spotify embed) and expose an AnalyserNode for the visualizer.
 * Browsers only allow this via the screen-share prompt ("This tab" + "Share tab
 * audio"); it works in desktop Chromium browsers and is hidden elsewhere.
 */

export type LiveStatus = 'off' | 'starting' | 'live' | 'denied' | 'noaudio' | 'error'

interface Connected {
  analyser: AnalyserNode
  close(): void
}

interface Deps {
  getDisplayMedia?: (opts: DisplayMediaStreamOptions & Record<string, unknown>) => Promise<MediaStream>
  /** Wire an audio stream into an analyser (real Web Audio in the app, a fake in tests). */
  connect(stream: MediaStream): Connected
}

interface LiveState {
  supported: boolean
  status: LiveStatus
  analyser: AnalyserNode | null
  start(): Promise<void>
  stop(): void
}

export const createLiveSpectrum = (deps: Deps) =>
  create<LiveState>()((set, get) => {
    let stream: MediaStream | null = null
    let connected: Connected | null = null

    const teardown = () => {
      stream?.getTracks().forEach((t) => t.stop())
      connected?.close()
      stream = null
      connected = null
    }

    return {
      supported: typeof deps.getDisplayMedia === 'function',
      status: 'off',
      analyser: null,
      async start() {
        if (!deps.getDisplayMedia || get().status === 'starting') return
        teardown()
        set({ status: 'starting' })
        try {
          const s = await deps.getDisplayMedia({
            video: true, // required by the API; the video track is dropped immediately
            // Keep playing the sound locally while we listen (Chrome option, not yet in TS DOM types).
            audio: { suppressLocalAudioPlayback: false } as MediaTrackConstraints,
            preferCurrentTab: true,
            selfBrowserSurface: 'include',
            systemAudio: 'exclude',
          })
          s.getVideoTracks().forEach((t) => t.stop())
          const audio = s.getAudioTracks()
          if (!audio.length) {
            s.getTracks().forEach((t) => t.stop())
            set({ status: 'noaudio', analyser: null })
            return
          }
          stream = s
          connected = deps.connect(s)
          // Ending the share (browser bar "Stop sharing") returns to standard mode.
          audio[0]!.addEventListener('ended', () => {
            teardown()
            set({ status: 'off', analyser: null })
          })
          set({ status: 'live', analyser: connected.analyser })
        } catch (e) {
          teardown()
          set({ status: (e as Error)?.name === 'NotAllowedError' ? 'denied' : 'error', analyser: null })
        }
      },
      stop() {
        teardown()
        set({ status: 'off', analyser: null })
      },
    }
  })

function webAudioConnect(stream: MediaStream): Connected {
  const ctx = new AudioContext()
  const source = ctx.createMediaStreamSource(new MediaStream(stream.getAudioTracks()))
  const analyser = ctx.createAnalyser()
  analyser.fftSize = 2048
  analyser.smoothingTimeConstant = 0.72
  // Not connected to ctx.destination: the tab already plays the sound; this only listens.
  source.connect(analyser)
  return { analyser, close: () => void ctx.close() }
}

const md = typeof navigator !== 'undefined' ? navigator.mediaDevices : undefined
const ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''
const isPhone = /Android|iPhone|iPad|iPod/i.test(ua)
// Only Chromium browsers share *tab audio*; Safari/Firefox expose getDisplayMedia without it.
const brands = (typeof navigator !== 'undefined' && (navigator as Navigator & { userAgentData?: { brands: { brand: string }[] } }).userAgentData?.brands) || []
const isChromium = brands.some((b) => /Chromium|Google Chrome|Microsoft Edge/.test(b.brand))

export const useLiveSpectrum = createLiveSpectrum({
  getDisplayMedia:
    md?.getDisplayMedia && isChromium && !isPhone && typeof AudioContext !== 'undefined'
      ? (opts) => md.getDisplayMedia(opts as DisplayMediaStreamOptions)
      : undefined,
  connect: webAudioConnect,
})
