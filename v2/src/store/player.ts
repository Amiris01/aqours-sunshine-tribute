import { create } from 'zustand'
import { releases, spotifyUri, type Release } from '../content/discography'

export type Status = 'idle' | 'loading' | 'playing' | 'paused' | 'error'

/** What the store needs from a playback backend (Spotify bridge in the app, a fake in tests). */
export interface Engine {
  load(uri: string): void
  toggle(): void
  seek(seconds: number): void
  pause(): void
}

export interface Progress {
  position: number
  duration: number
  paused: boolean
  buffering: boolean
}

export interface PlayerState {
  queue: Release[]
  /** Active track, or -1 when the player is closed. */
  index: number
  status: Status
  position: number
  duration: number
  minimized: boolean
  engine: Engine | null
  /** Spotify couldn't be reached; stays set until retry() or an engine attaches. */
  engineFailed: boolean
  playAt(i: number): void
  toggle(): void
  next(): void
  prev(): void
  seek(seconds: number): void
  close(): void
  attachEngine(engine: Engine): void
  fail(): void
  retry(): void
  report(p: Progress): void
  ended(): void
  setMinimized(v: boolean): void
}

export const createPlayerStore = (queue: Release[] = releases) =>
  create<PlayerState>()((set, get) => {
    const loadCurrent = () => {
      const { index, engine } = get()
      const track = get().queue[index]
      const uri = track && spotifyUri(track.spotify)
      if (engine && uri) engine.load(uri)
    }
    return {
      queue,
      index: -1,
      status: 'idle',
      position: 0,
      duration: 0,
      minimized: false,
      engine: null,
      engineFailed: false,
      playAt(i) {
        if (i < 0 || i >= get().queue.length) return
        // Without a working engine, keep showing the fallback (Open in Spotify + Retry).
        const status: Status = !get().engine && get().engineFailed ? 'error' : 'loading'
        set({ index: i, status, position: 0, duration: 0, minimized: false })
        loadCurrent()
      },
      toggle() {
        const { index, status, engine } = get()
        if (index < 0) return get().playAt(0)
        if (status === 'error') return
        engine?.toggle()
      },
      next() {
        const { index, queue: q } = get()
        if (index < 0) return
        get().playAt((index + 1) % q.length)
      },
      prev() {
        const { index, queue: q } = get()
        if (index < 0) return
        get().playAt((index - 1 + q.length) % q.length)
      },
      seek(seconds) {
        get().engine?.seek(seconds)
        set({ position: seconds })
      },
      close() {
        get().engine?.pause()
        set({ index: -1, status: 'idle', position: 0, duration: 0, minimized: false })
      },
      attachEngine(engine) {
        set({ engine, engineFailed: false })
        if (get().index >= 0) loadCurrent()
      },
      fail() {
        set({ engineFailed: true })
        if (get().index >= 0) set({ status: 'error' })
      },
      retry() {
        set({ engineFailed: false, status: get().index >= 0 ? 'loading' : 'idle' })
      },
      report({ position, duration, paused, buffering }) {
        if (get().index < 0) return
        const status: Status = buffering || (!duration && !paused) ? 'loading' : paused ? 'paused' : 'playing'
        set({ position, duration, status })
      },
      ended() {
        const { index, queue: q } = get()
        if (index < q.length - 1) get().playAt(index + 1)
        else set({ status: 'paused' })
      },
      setMinimized(v) {
        set({ minimized: v })
      },
    }
  })

export const usePlayer = createPlayerStore()
