import { useReveal } from '../hooks'
import { asset } from '../assets'
import { useLang } from '../i18n/LanguageContext'
import { subunits } from '../data'

// Official sub-unit wordmark logos, keyed by unit name. Files in
// /public/assets/logo/ (trimmed to content). All sit on a uniform light chip.
const UNIT_LOGOS = {
  'CYaRon!': '/assets/logo/cyaron.webp',
  AZALEA: '/assets/logo/azalea.webp',
  'Guilty Kiss': '/assets/logo/guilty-kiss.png',
}

function UnitCard({ u }) {
  const [ref, shown] = useReveal()
  const { t } = useLang()
  const logo = UNIT_LOGOS[u.name] ? asset(UNIT_LOGOS[u.name]) : null
  return (
    <div
      ref={ref}
      className={`unit-card reveal${shown ? ' in' : ''}`}
      style={{ '--c': u.color }}
    >
      {/* Faint lead-member emblem watermark for depth. */}
      {u.members[0]?.emblem && (
        <img className="unit-watermark" src={u.members[0].emblem} alt="" aria-hidden="true" />
      )}
      <div className="unit-glow" aria-hidden="true" />
      <div className="unit-head">
        {logo ? (
          <h3 className="unit-name has-logo">
            <span className="unit-logo-chip">
              <img className="unit-logo" src={logo} alt={u.name} />
            </span>
          </h3>
        ) : (
          <h3 className="unit-name">{u.name}</h3>
        )}
        <p className="unit-tagline">{t(`subunit.tagline.${u.name}`)}</p>
      </div>

      <div className="unit-roster">
        {u.members.map((m) => (
          <div className="unit-avatar" key={m.num} style={{ '--c': m.color }}>
            <div className="unit-avatar-ring">
              {m.emblem ? (
                <img className="unit-emblem" src={m.emblem} alt="" />
              ) : (
                <span className="unit-dot" />
              )}
            </div>
            <span className="unit-member-name">{m.name.split(' ')[0]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function SubUnits() {
  const [headRef, headShown] = useReveal()
  const { t } = useLang()
  return (
    <section className="section subunits">
      <div ref={headRef} className={`reveal${headShown ? ' in' : ''}`}>
        <div className="eyebrow">{t('subunits.eyebrow')}</div>
        <h2 className="h2">{t('subunits.h2')}</h2>
        <p className="lead">{t('subunits.lead')}</p>
      </div>
      <div className="unit-grid">
        {subunits.map((u) => (
          <UnitCard key={u.name} u={u} />
        ))}
      </div>
    </section>
  )
}
