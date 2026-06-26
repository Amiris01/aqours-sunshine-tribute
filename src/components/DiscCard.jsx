import { useReveal } from '../hooks'
import { useLang } from '../i18n/LanguageContext'

// Accent gradients cycled across the grid, drawn from the brand palette. Used
// as a tint overlay on the cover art so each tile feels on-theme.
const ACCENTS = [
  'linear-gradient(160deg, rgba(255,122,89,0.0), rgba(255,122,89,0.45))',
  'linear-gradient(160deg, rgba(54,182,240,0.0), rgba(0,119,182,0.45))',
  'linear-gradient(160deg, rgba(22,182,168,0.0), rgba(54,182,240,0.45))',
  'linear-gradient(160deg, rgba(166,115,196,0.0), rgba(255,123,176,0.45))',
  'linear-gradient(160deg, rgba(255,207,63,0.0), rgba(255,125,46,0.45))',
  'linear-gradient(160deg, rgba(242,121,159,0.0), rgba(166,115,196,0.45))',
]

export default function DiscCard({ d, index = 0, isPlaying, onPlay }) {
  const [ref, shown] = useReveal()
  const { t } = useLang()

  return (
    <button
      ref={ref}
      type="button"
      className={`disc-tile reveal${shown ? ' in' : ''}${isPlaying ? ' playing' : ''}`}
      style={{ '--tint': ACCENTS[index % ACCENTS.length] }}
      onClick={onPlay}
      aria-label={t('disc.play', { title: d.title })}
    >
      <div className="disc-art">
        {d.cover ? (
          <img src={d.cover} alt="" loading="lazy" />
        ) : (
          <div className="disc-art-fallback" />
        )}
        <span className="disc-tint" />
        <span className="disc-play" aria-hidden="true">
          {isPlaying ? (
            // equalizer bars when this track is the one playing
            <span className="disc-eq">
              <i />
              <i />
              <i />
            </span>
          ) : (
            '▶'
          )}
        </span>
        <div className="disc-meta">
          <span className="disc-year">{d.year}</span>
          <span className="disc-title">{d.title}</span>
        </div>
      </div>
    </button>
  )
}
