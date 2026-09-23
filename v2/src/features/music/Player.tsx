import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { AnimatePresence, m as motion } from 'motion/react'
import * as Slider from '@radix-ui/react-slider'
import { useShallow } from 'zustand/react/shallow'
import { usePlayer } from '../../store/player'
import { spotifyOpenUrl, spotifyUri } from '../../content/discography'
import { useT } from '../../i18n'
import { fmtTime } from '../../lib/format'
import { onColor } from '../../lib/color'
import { CloseIcon, MinimizeIcon, NextIcon, PauseIcon, PlayIcon, PrevIcon } from '../../lib/icons'
import { startSpotify } from './spotifyBridge'

const btn = 'grid size-10 place-items-center rounded-[3px] text-ink transition hover:bg-line disabled:opacity-40'

export function Player() {
  const t = useT()
  const { queue, index, status, position, duration, minimized } = usePlayer(
    useShallow((s) => ({
      queue: s.queue, index: s.index, status: s.status,
      position: s.position, duration: s.duration, minimized: s.minimized,
    })),
  )
  // Spotify replaces its host element with an iframe, so React only owns the container
  // and every (re)start gets a brand-new host div.
  const containerRef = useRef<HTMLDivElement>(null)
  const startedRef = useRef(false)
  const [drag, setDrag] = useState<number | null>(null)

  const start = useCallback(() => {
    const container = containerRef.current
    const first = queue[Math.max(usePlayer.getState().index, 0)]
    const uri = first && spotifyUri(first.spotify)
    if (!container || !uri) return
    startedRef.current = true
    const host = document.createElement('div')
    container.replaceChildren(host)
    void startSpotify(host, usePlayer.getState(), uri)
  }, [queue])

  // Load Spotify only once the visitor actually plays something.
  useEffect(() => {
    if (index >= 0 && !startedRef.current) start()
  }, [index, start])

  // Focus management: remember what opened the player so Close can return there,
  // and hand focus to the top-bar pill when minimizing (the buttons unmount).
  const returnFocusRef = useRef<HTMLElement | null>(null)
  const wasOpenRef = useRef(false)
  useEffect(() => {
    const open = index >= 0
    if (open && !wasOpenRef.current) {
      const el = document.activeElement
      returnFocusRef.current = el instanceof HTMLElement && el !== document.body ? el : null
    }
    wasOpenRef.current = open
  }, [index])
  useEffect(() => {
    if (minimized) document.querySelector<HTMLElement>('[data-np-pill]')?.focus()
  }, [minimized])

  const close = () => {
    const back = returnFocusRef.current
    usePlayer.getState().close()
    if (back?.isConnected) back.focus()
  }

  const retry = () => {
    usePlayer.getState().retry()
    start()
  }

  const track = index >= 0 ? queue[index] : undefined
  const playing = status === 'playing'
  const openUrl = track ? spotifyOpenUrl(track.spotify) : null
  const code = `M${String(index + 1).padStart(2, '0')}`

  return (
    <>
      {/* Spotify iframe host. The embed only initialises (fires `ready`) when its iframe is
          inside the viewport with real size — a zero-height, clipped or off-screen host never
          becomes ready. So: full 80px size, fixed in view, invisible and click-through. */}
      <div
        data-testid="spotify-host"
        aria-hidden="true"
        style={{ position: 'fixed', left: 0, bottom: 0, width: '300px', height: '80px', opacity: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}
      >
        <div ref={containerRef} />
      </div>
      <AnimatePresence>
        {track && !minimized && (
          <motion.section
            key="player"
            aria-label={t('np.region')}
            initial={{ y: 120 }}
            animate={{ y: 0 }}
            exit={{ y: 120 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ '--accent': track.accent } as CSSProperties}
            className="fixed inset-x-0 bottom-0 z-40 border-t-4 border-[var(--accent)] bg-deep"
          >
            <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 md:flex-nowrap">
              <img src={track.cover} alt="" className="size-12 shrink-0 rounded-[3px]" />
              <div className="min-w-0 flex-1 md:w-56 md:flex-none">
                <p className="flex items-center gap-2 text-sm">
                  <span className="font-led text-[var(--accent)]">{code}</span>
                  <span className="text-haze">{status === 'loading' ? t('np.loading') : t('np.onAir')}</span>
                </p>
                <p className="truncate font-bold">{track.title}</p>
              </div>

              {status === 'error' ? (
                <div className="flex flex-1 flex-wrap items-center gap-3 text-sm">
                  <span>{t('np.error')}</span>
                  {openUrl && (
                    <a
                      href={openUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: onColor(track.accent) }}
                      className="rounded-[3px] bg-[var(--accent)] px-3 py-1.5 font-bold"
                    >
                      {t('np.openSpotify')}
                    </a>
                  )}
                  <button type="button" onClick={retry} className="rounded-[3px] border border-line px-3 py-1.5 hover:border-ink">
                    {t('np.retry')}
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-1">
                    <button type="button" className={btn} onClick={() => usePlayer.getState().prev()} aria-label={t('np.prev')}><PrevIcon /></button>
                    <button
                      type="button"
                      onClick={() => usePlayer.getState().toggle()}
                      aria-label={playing ? t('np.pause') : t('np.play')}
                      style={{ color: onColor(track.accent) }}
                      className="grid size-11 place-items-center rounded-[3px] bg-[var(--accent)] transition hover:brightness-110"
                    >
                      {status === 'loading' ? (
                        <span className="size-4 rounded-full border-2 border-current border-t-transparent motion-safe:animate-spin" />
                      ) : playing ? <PauseIcon /> : <PlayIcon />}
                    </button>
                    <button type="button" className={btn} onClick={() => usePlayer.getState().next()} aria-label={t('np.next')}><NextIcon /></button>
                  </div>
                  <div className="flex w-full items-center gap-3 font-led text-haze md:w-auto md:flex-1">
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
                      <Slider.Track className="relative h-1 grow bg-line">
                        <Slider.Range className="absolute h-full bg-[var(--accent)]" />
                      </Slider.Track>
                      <Slider.Thumb aria-label={t('np.seek')} className="block h-4 w-1.5 bg-ink" />
                    </Slider.Root>
                    <span>{fmtTime(duration)}</span>
                  </div>
                </>
              )}

              <div className="ml-auto flex items-center gap-1">
                {status !== 'error' && openUrl && (
                  <a
                    href={openUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mr-1 inline-block whitespace-nowrap rounded-[3px] border border-line px-3 py-1.5 text-sm text-haze transition hover:border-ink hover:text-ink"
                  >
                    {t('np.openSpotify')}
                  </a>
                )}
                <button type="button" className={btn} onClick={() => usePlayer.getState().setMinimized(true)} aria-label={t('np.minimize')}><MinimizeIcon /></button>
                <button type="button" className={btn} onClick={close} aria-label={t('np.close')}><CloseIcon /></button>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  )
}
