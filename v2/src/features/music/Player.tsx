import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { AnimatePresence, m as motion } from 'motion/react'
import * as Slider from '@radix-ui/react-slider'
import { useShallow } from 'zustand/react/shallow'
import { usePlayer } from '../../store/player'
import { spotifyOpenUrl, spotifyUri } from '../../content/discography'
import { useT } from '../../i18n'
import { fmtTime } from '../../lib/format'
import { startSpotify } from './spotifyBridge'

const btn = 'grid size-10 place-items-center rounded-full text-ink transition hover:bg-white/10 disabled:opacity-40'

export function Player() {
  const t = useT()
  const { queue, index, status, position, duration, minimized } = usePlayer(
    useShallow((s) => ({
      queue: s.queue, index: s.index, status: s.status,
      position: s.position, duration: s.duration, minimized: s.minimized,
    })),
  )
  const hostRef = useRef<HTMLDivElement>(null)
  const startedRef = useRef(false)
  const [drag, setDrag] = useState<number | null>(null)

  const start = useCallback(() => {
    const host = hostRef.current
    const first = queue[Math.max(usePlayer.getState().index, 0)]
    const uri = first && spotifyUri(first.spotify)
    if (!host || !uri) return
    startedRef.current = true
    void startSpotify(host, usePlayer.getState(), uri)
  }, [queue])

  // Load Spotify only once the visitor actually plays something.
  useEffect(() => {
    if (index >= 0 && !startedRef.current) start()
  }, [index, start])

  const retry = () => {
    usePlayer.setState({ status: 'loading' })
    start()
  }

  const track = index >= 0 ? queue[index] : undefined
  const playing = status === 'playing'
  const openUrl = track ? spotifyOpenUrl(track.spotify) : null

  return (
    <>
      {/* Spotify iframe host: in-flow, zero height (a 1px/opacity-0 iframe breaks playback). */}
      <div className="pointer-events-none h-0 overflow-hidden" aria-hidden="true">
        <div ref={hostRef} />
      </div>
      <div role="status" aria-live="polite" className="sr-only">
        {track ? `${t('np.nowPlaying')}: ${track.title}` : ''}
      </div>
      <AnimatePresence>
        {track && !minimized && (
          <motion.section
            key="player"
            aria-label={t('np.region')}
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 260 }}
            style={{ '--accent': track.accent } as CSSProperties}
            className="fixed inset-x-3 bottom-3 z-40 mx-auto max-w-4xl rounded-2xl border border-white/10 bg-sea-900/85 p-3 shadow-2xl shadow-black/50 backdrop-blur-xl"
          >
            <div className="absolute inset-x-6 -top-px h-px bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent" aria-hidden="true" />
            <div className="flex flex-wrap items-center gap-3 md:flex-nowrap">
              <img src={track.cover} alt="" className="size-12 shrink-0 rounded-lg" />
              <div className="min-w-0 flex-1 md:w-48 md:flex-none">
                <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--accent)]">
                  {status === 'loading' ? t('np.loading') : t('np.nowPlaying')}
                </p>
                <p className="truncate font-semibold">{track.title}</p>
              </div>

              {status === 'error' ? (
                <div className="flex flex-1 flex-wrap items-center gap-3 text-sm">
                  <span className="text-mist">{t('np.error')}</span>
                  {openUrl && (
                    <a href={openUrl} target="_blank" rel="noopener noreferrer" className="rounded-full bg-aqua px-3 py-1.5 font-semibold text-sea-950">
                      {t('np.openSpotify')}
                    </a>
                  )}
                  <button type="button" onClick={retry} className="rounded-full border border-white/20 px-3 py-1.5">
                    {t('np.retry')}
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-1">
                    <button type="button" className={btn} onClick={() => usePlayer.getState().prev()} aria-label={t('np.prev')}>⏮</button>
                    <button
                      type="button"
                      onClick={() => usePlayer.getState().toggle()}
                      aria-label={playing ? t('np.pause') : t('np.play')}
                      className="grid size-11 place-items-center rounded-full bg-[var(--accent)] text-sea-950 transition hover:brightness-110"
                    >
                      {status === 'loading' ? (
                        <span className="size-4 animate-spin rounded-full border-2 border-sea-950 border-t-transparent" />
                      ) : playing ? '❚❚' : '▶'}
                    </button>
                    <button type="button" className={btn} onClick={() => usePlayer.getState().next()} aria-label={t('np.next')}>⏭</button>
                  </div>
                  <div className="flex w-full items-center gap-2 text-xs tabular-nums text-mist md:w-auto md:flex-1">
                    <span>{fmtTime(drag ?? position)}</span>
                    <Slider.Root
                      className="relative flex h-5 flex-1 touch-none select-none items-center"
                      value={[drag ?? position]}
                      max={duration || 1}
                      step={0.5}
                      disabled={!duration}
                      onValueChange={([v]) => setDrag(v ?? null)}
                      onValueCommit={([v]) => {
                        if (v !== undefined) usePlayer.getState().seek(v)
                        setDrag(null)
                      }}
                    >
                      <Slider.Track className="relative h-1 grow rounded-full bg-white/15">
                        <Slider.Range className="absolute h-full rounded-full bg-[var(--accent)]" />
                      </Slider.Track>
                      <Slider.Thumb aria-label={t('np.seek')} className="block size-3.5 rounded-full bg-white shadow" />
                    </Slider.Root>
                    <span>{fmtTime(duration)}</span>
                  </div>
                </>
              )}

              <div className="ml-auto flex items-center">
                <button type="button" className={btn} onClick={() => usePlayer.getState().setMinimized(true)} aria-label={t('np.minimize')}>▾</button>
                <button type="button" className={btn} onClick={() => usePlayer.getState().close()} aria-label={t('np.close')}>✕</button>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  )
}
