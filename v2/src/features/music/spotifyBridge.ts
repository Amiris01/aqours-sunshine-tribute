import type { Engine, Progress } from '../../store/player'

// The only module that talks to Spotify's IFrame API.

export interface PlaybackData {
  position?: number
  duration?: number
  isPaused?: boolean
  isBuffering?: boolean
}

export interface SpotifyController {
  loadUri(uri: string): void
  play(): void
  togglePlay(): void
  pause(): void
  seek(seconds: number): void
  addListener(event: 'ready' | 'playback_update', cb: (e: { data?: PlaybackData }) => void): void
}

export interface SpotifyIFrameAPI {
  createController(
    el: HTMLElement,
    opts: { uri: string; width: string | number; height: number },
    cb: (controller: SpotifyController) => void,
  ): void
}

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: SpotifyIFrameAPI) => void
    SpotifyIframeApi?: SpotifyIFrameAPI
  }
}

export interface PlayerSink {
  attachEngine(engine: Engine): void
  report(p: Progress): void
  ended(): void
  fail(): void
}

let apiPromise: Promise<SpotifyIFrameAPI> | null = null

export function resetSpotifyApiForTests() {
  apiPromise = null
}

export function loadSpotifyApi(timeoutMs = 10_000): Promise<SpotifyIFrameAPI> {
  if (apiPromise) return apiPromise
  const p = new Promise<SpotifyIFrameAPI>((resolve, reject) => {
    if (window.SpotifyIframeApi) return resolve(window.SpotifyIframeApi)
    const timer = window.setTimeout(() => reject(new Error('Spotify IFrame API timed out')), timeoutMs)
    window.onSpotifyIframeApiReady = (api) => {
      window.clearTimeout(timer)
      window.SpotifyIframeApi = api
      resolve(api)
    }
    const tag = document.createElement('script')
    tag.src = 'https://open.spotify.com/embed/iframe-api/v1'
    tag.async = true
    tag.onerror = () => {
      window.clearTimeout(timer)
      reject(new Error('Spotify IFrame API failed to load'))
    }
    document.body.appendChild(tag)
  })
  // Forget a failed attempt so Retry can try again.
  apiPromise = p.catch((err: unknown) => {
    apiPromise = null
    throw err
  })
  return apiPromise
}

const END_SLACK_S = 0.4
/** An update this far before the end proves the (new) track is actually playing. */
const ARM_MARGIN_S = 2

export function createSpotifyEngine(
  api: SpotifyIFrameAPI,
  host: HTMLElement,
  sink: PlayerSink,
  initialUri: string,
  readyTimeoutMs = 15_000,
) {
  let ready = false
  let failed = false
  // The iframe can be blocked (extension, frame-src, network) after the script loaded.
  const readyTimer = window.setTimeout(() => {
    if (ready) return
    failed = true
    sink.fail()
  }, readyTimeoutMs)

  api.createController(host, { uri: initialUri, width: '100%', height: 80 }, (c) => {
    // Auto-advance fires once per track: disarmed on every load, re-armed only by an
    // update from mid-track. Stale end-of-track updates from the previous track that
    // arrive after a load (Spotify queues several) can therefore never cascade.
    let armed = false
    // The URI the embed currently holds; asking for it again only needs play() —
    // loadUri reloads the embed (and makes it fire `ready` again).
    let loaded = initialUri
    const engine: Engine = {
      load(uri) {
        armed = false
        if (uri !== loaded) {
          loaded = uri
          c.loadUri(uri)
        }
        c.play()
      },
      toggle: () => c.togglePlay(),
      seek: (s) => c.seek(s),
      pause: () => c.pause(),
    }
    c.addListener('ready', () => {
      if (failed) return // too late: the player already shows the fallback
      // Spotify fires `ready` again after every loadUri; attaching again would reload
      // the current track and loop forever, so only the first one counts.
      if (ready) return
      ready = true
      window.clearTimeout(readyTimer)
      sink.attachEngine(engine)
    })
    c.addListener('playback_update', (e) => {
      const d = e.data ?? {}
      const position = (d.position ?? 0) / 1000
      const duration = (d.duration ?? 0) / 1000
      const progress = { position, duration, paused: Boolean(d.isPaused), buffering: Boolean(d.isBuffering) }
      if (duration <= 0) return sink.report(progress)
      if (!armed) {
        // Near-the-end updates before the new track has started are the previous
        // track's stale tail: drop them so the new track's status doesn't flicker.
        if (position >= duration - ARM_MARGIN_S) return
        armed = true
        return sink.report(progress)
      }
      sink.report(progress)
      if (position >= duration - END_SLACK_S) {
        armed = false
        sink.ended()
      }
    })
  })
}

export async function startSpotify(host: HTMLElement, sink: PlayerSink, initialUri: string) {
  try {
    const api = await loadSpotifyApi()
    createSpotifyEngine(api, host, sink, initialUri)
  } catch {
    sink.fail()
  }
}
