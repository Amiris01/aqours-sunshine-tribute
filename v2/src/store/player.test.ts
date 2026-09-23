import { vi } from 'vitest'
import { createPlayerStore, type Engine } from './player'
import type { Release } from '../content/discography'

const rel = (id: string, track: string): Release => ({
  id, year: 2016, title: id, titleJp: id, kind: { en: 'x', ja: 'x' },
  spotify: `https://open.spotify.com/embed/track/${track}`, cover: '', accent: '#000000', blurb: { en: 'x', ja: 'x' },
})
const queue = [rel('a', 'A1'), rel('b', 'B2'), rel('c', 'C3')]
const fakeEngine = (): Engine => ({ load: vi.fn(), toggle: vi.fn(), seek: vi.fn(), pause: vi.fn() })

it('starts closed', () => {
  const s = createPlayerStore(queue).getState()
  expect(s.index).toBe(-1)
  expect(s.status).toBe('idle')
})

it('loads the last requested track when clicks race', () => {
  const store = createPlayerStore(queue)
  const engine = fakeEngine()
  store.getState().attachEngine(engine)
  store.getState().playAt(1)
  store.getState().playAt(2)
  expect(store.getState().index).toBe(2)
  expect(engine.load).toHaveBeenLastCalledWith('spotify:track:C3')
  expect(store.getState().status).toBe('loading')
})

it('queues the pending track until an engine attaches', () => {
  const store = createPlayerStore(queue)
  store.getState().playAt(1)
  const engine = fakeEngine()
  store.getState().attachEngine(engine)
  expect(engine.load).toHaveBeenCalledWith('spotify:track:B2')
})

it('wraps next/prev', () => {
  const store = createPlayerStore(queue)
  store.getState().playAt(2)
  store.getState().next()
  expect(store.getState().index).toBe(0)
  store.getState().prev()
  expect(store.getState().index).toBe(2)
})

it('auto-advances on end and stops after the last track', () => {
  const store = createPlayerStore(queue)
  store.getState().playAt(1)
  store.getState().ended()
  expect(store.getState().index).toBe(2)
  store.getState().ended()
  expect(store.getState().index).toBe(2)
  expect(store.getState().status).toBe('paused')
})

it('derives status from progress reports', () => {
  const store = createPlayerStore(queue)
  store.getState().playAt(0)
  store.getState().report({ position: 3, duration: 90, paused: false, buffering: false })
  expect(store.getState()).toMatchObject({ status: 'playing', position: 3, duration: 90 })
  store.getState().report({ position: 3, duration: 90, paused: true, buffering: false })
  expect(store.getState().status).toBe('paused')
  store.getState().report({ position: 3, duration: 90, paused: false, buffering: true })
  expect(store.getState().status).toBe('loading')
})

it('ignores reports while closed and pauses the engine on close', () => {
  const store = createPlayerStore(queue)
  const engine = fakeEngine()
  store.getState().attachEngine(engine)
  store.getState().playAt(0)
  store.getState().close()
  expect(engine.pause).toHaveBeenCalled()
  store.getState().report({ position: 5, duration: 90, paused: false, buffering: false })
  expect(store.getState()).toMatchObject({ index: -1, status: 'idle', position: 0 })
})

it('toggle starts the queue when closed, and delegates when open', () => {
  const store = createPlayerStore(queue)
  const engine = fakeEngine()
  store.getState().attachEngine(engine)
  store.getState().toggle()
  expect(store.getState().index).toBe(0)
  store.getState().toggle()
  expect(engine.toggle).toHaveBeenCalledTimes(1)
})

it('keeps the error fallback when another track is played after Spotify failed', () => {
  const store = createPlayerStore(queue)
  store.getState().playAt(0)
  store.getState().fail()
  store.getState().playAt(2)
  expect(store.getState()).toMatchObject({ index: 2, status: 'error' })
  store.getState().close()
  store.getState().playAt(1)
  expect(store.getState().status).toBe('error')
})

it('ignores a late failure after the player was closed, but remembers it', () => {
  const store = createPlayerStore(queue)
  store.getState().playAt(0)
  store.getState().close()
  store.getState().fail()
  expect(store.getState().status).toBe('idle')
  store.getState().playAt(0)
  expect(store.getState().status).toBe('error')
})

it('retry clears the failure and an attached engine clears it too', () => {
  const store = createPlayerStore(queue)
  store.getState().playAt(0)
  store.getState().fail()
  store.getState().retry()
  expect(store.getState().status).toBe('loading')
  store.getState().playAt(1)
  expect(store.getState().status).toBe('loading')
})

it('seek updates position and calls the engine', () => {
  const store = createPlayerStore(queue)
  const engine = fakeEngine()
  store.getState().attachEngine(engine)
  store.getState().playAt(0)
  store.getState().seek(42)
  expect(engine.seek).toHaveBeenCalledWith(42)
  expect(store.getState().position).toBe(42)
})

it('loads only the last of several tracks requested before the engine attaches', () => {
  const store = createPlayerStore(queue)
  store.getState().playAt(0)
  store.getState().playAt(2)
  const engine = fakeEngine()
  store.getState().attachEngine(engine)
  expect(engine.load).toHaveBeenCalledTimes(1)
  expect(engine.load).toHaveBeenCalledWith('spotify:track:C3')
})
