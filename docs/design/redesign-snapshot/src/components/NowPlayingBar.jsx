import { useEffect, useRef, useState } from 'react'

// Load Spotify's IFrame API once and resolve when ready.
let apiPromise = null
function loadSpotifyApi() {
  if (apiPromise) return apiPromise
  apiPromise = new Promise((resolve) => {
    if (window.SpotifyIframeApi) {
      resolve(window.SpotifyIframeApi)
      return
    }
    window.onSpotifyIframeApiReady = (IFrameAPI) => {
      window.SpotifyIframeApi = IFrameAPI
      resolve(IFrameAPI)
    }
    const tag = document.createElement('script')
    tag.src = 'https://open.spotify.com/embed/iframe-api/v1'
    tag.async = true
    document.body.appendChild(tag)
  })
  return apiPromise
}

// Extract a Spotify URI (spotify:track:ID / spotify:album:ID) from an embed URL.
function toUri(embedUrl) {
  const m = embedUrl.match(/embed\/(track|album|playlist|episode)\/([A-Za-z0-9]+)/)
  return m ? `spotify:${m[1]}:${m[2]}` : null
}

function fmt(sec) {
  if (!sec || sec < 0 || !isFinite(sec)) return '0:00'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

/**
 * Persistent now-playing dock with a fully custom UI over a hidden Spotify
 * embed (controlled via the IFrame API). Drives a whole playlist: prev/next,
 * auto-advance when a track ends, a loading state while buffering, and a
 * drag-to-scrub progress bar.
 *
 * Props:
 *   tracks        - array of disc entries ({ title, spotify, cover, ... })
 *   index         - index of the active track, or -1 when the dock is closed
 *   onIndexChange - (i) => void  to move to a different track
 *   onClose       - () => void
 */
export default function NowPlayingBar({ tracks, index, onIndexChange, onClose }) {
  const hostRef = useRef(null)
  const controllerRef = useRef(null)
  const readyRef = useRef(false)
  const indexRef = useRef(index)
  indexRef.current = index

  const [paused, setPaused] = useState(true)
  const [loading, setLoading] = useState(false)
  const [pos, setPos] = useState(0) // seconds
  const [dur, setDur] = useState(0) // seconds
  const [dragRatio, setDragRatio] = useState(null) // 0..1 while dragging, else null

  const open = index >= 0 && index < tracks.length
  const track = open ? tracks[index] : null

  // Guard so a single end-of-track event doesn't advance more than once.
  const advancedRef = useRef(false)

  // Create the controller once, eagerly, so it's ready before the first click.
  useEffect(() => {
    let cancelled = false
    loadSpotifyApi().then((IFrameAPI) => {
      if (cancelled || !hostRef.current || controllerRef.current) return
      IFrameAPI.createController(
        hostRef.current,
        { uri: 'spotify:track:3qDPN5KBpu63ieMoommmVm', width: '100%', height: 80 },
        (controller) => {
          controllerRef.current = controller
          controller.addListener('ready', () => {
            readyRef.current = true
          })
          controller.addListener('playback_update', (e) => {
            const d = e.data || {}
            const p = (d.position || 0) / 1000
            const t = (d.duration || 0) / 1000
            setPaused(Boolean(d.isPaused))
            setPos(p)
            setDur(t)
            // buffering=true (or no duration yet) => loading
            setLoading(Boolean(d.isBuffering) || (!t && !d.isPaused))

            // Auto-advance: track reached its end.
            if (t > 0 && p >= t - 0.4 && !advancedRef.current) {
              advancedRef.current = true
              const next = indexRef.current + 1
              if (next < tracks.length) onIndexChange(next)
            }
          })
        }
      )
    })
    return () => {
      cancelled = true
    }
  }, [tracks.length, onIndexChange])

  // When the active track changes, load + play it.
  useEffect(() => {
    if (!open) return
    const uri = toUri(track.spotify)
    if (!uri) return
    advancedRef.current = false
    setLoading(true)
    setPos(0)
    setDur(0)

    let tries = 0
    let timer = null
    const start = () => {
      const c = controllerRef.current
      if (c && readyRef.current) {
        c.loadUri(uri)
        c.play()
        return
      }
      if (tries++ < 40) timer = setTimeout(start, 100)
    }
    start()
    return () => timer && clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index])

  // Pause (don't destroy) when the dock closes, so the controller is reusable.
  useEffect(() => {
    if (open || !controllerRef.current) return
    try {
      controllerRef.current.pause()
    } catch {
      /* no-op */
    }
  }, [open])

  const toggle = () => controllerRef.current?.togglePlay()
  const prev = () => open && index > 0 && onIndexChange(index - 1)
  const next = () => open && index < tracks.length - 1 && onIndexChange(index + 1)

  // --- drag-to-scrub --------------------------------------------------------
  const trackElRef = useRef(null)
  const ratioFromEvent = (clientX) => {
    const rect = trackElRef.current.getBoundingClientRect()
    return Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
  }
  const commitSeek = (ratio) => {
    if (controllerRef.current && dur) {
      controllerRef.current.seek(ratio * dur)
      setPos(ratio * dur)
    }
  }
  const onPointerDown = (e) => {
    if (!dur) return
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragRatio(ratioFromEvent(e.clientX))
  }
  const onPointerMove = (e) => {
    if (dragRatio === null) return
    setDragRatio(ratioFromEvent(e.clientX))
  }
  const onPointerUp = (e) => {
    if (dragRatio === null) return
    const r = ratioFromEvent(e.clientX)
    commitSeek(r)
    setDragRatio(null)
  }

  const liveRatio = dragRatio !== null ? dragRatio : dur ? pos / dur : 0
  const progress = liveRatio * 100
  const shownPos = dragRatio !== null ? dragRatio * dur : pos

  const canPrev = open && index > 0
  const canNext = open && index < tracks.length - 1

  return (
    <div className={`np-bar${open ? ' open' : ''}`} aria-hidden={!open}>
      <div className="np-inner">
        <div className="np-label">
          {track?.cover && <img className="np-cover" src={track.cover} alt="" />}
          <div className="np-text">
            <span className="np-now">
              <span className={`np-eq${paused || loading ? ' paused' : ''}`} aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              {loading ? 'Loading…' : 'Now playing'}
            </span>
            <span className="np-title">{track ? track.title : ''}</span>
          </div>
        </div>

        <div className="np-controls">
          <button
            type="button"
            className="np-skip"
            onClick={prev}
            disabled={!canPrev}
            aria-label="Previous track"
          >
            ⏮
          </button>
          <button
            type="button"
            className="np-play"
            onClick={toggle}
            aria-label={paused ? 'Play' : 'Pause'}
          >
            {loading ? <span className="np-spinner" /> : paused ? '▶' : '❚❚'}
          </button>
          <button
            type="button"
            className="np-skip"
            onClick={next}
            disabled={!canNext}
            aria-label="Next track"
          >
            ⏭
          </button>
        </div>

        <div className="np-progress">
          <span className="np-time">{fmt(shownPos)}</span>
          <div
            className={`np-track${dragRatio !== null ? ' dragging' : ''}`}
            ref={trackElRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          >
            <div className="np-fill" style={{ width: `${progress}%` }}>
              <span className="np-knob" />
            </div>
          </div>
          <span className="np-time">{fmt(dur)}</span>
        </div>

        <button type="button" className="np-close" onClick={onClose} aria-label="Close player">
          ×
        </button>
      </div>

      {/* Hidden Spotify iframe — controlled entirely via the IFrame API. */}
      <div className="np-hidden-host" aria-hidden="true">
        <div ref={hostRef} />
      </div>
    </div>
  )
}
