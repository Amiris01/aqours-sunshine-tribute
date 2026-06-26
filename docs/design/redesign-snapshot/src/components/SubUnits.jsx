import { useReveal } from '../hooks'
import { subunits } from '../data'

function UnitCard({ u }) {
  const [ref, shown] = useReveal()
  // Use the first member's emblem as the header watermark graphic.
  const wm = u.members.find((m) => m.emblem)?.emblem || null
  return (
    <div
      ref={ref}
      className={`unit-card reveal${shown ? ' in' : ''}`}
      style={{ '--c': u.color }}
    >
      <div className="unit-head">
        {wm && <img className="unit-emblem-wm" src={wm} alt="" aria-hidden="true" />}
        <h3 className="unit-name">{u.name}</h3>
        <p className="unit-tagline">{u.tagline}</p>
      </div>
      <div className="unit-members">
        {u.members.map((m) => (
          <div className="unit-member" key={m.num} style={{ '--mc': m.color }}>
            {m.emblem ? (
              <img className="unit-emblem" src={m.emblem} alt="" />
            ) : (
              <span className="unit-dot" />
            )}
            <span className="unit-member-name">{m.name.split(' ')[0]}</span>
            <span className="unit-member-swatch" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function SubUnits() {
  const [headRef, headShown] = useReveal()
  return (
    <section className="section subunits">
      <div ref={headRef} className={`reveal${headShown ? ' in' : ''}`}>
        <div className="eyebrow">Three Sub-units</div>
        <h2 className="h2">Smaller groups, same shine.</h2>
        <p className="lead">
          Beyond the full nine, Aqours splits into three sub-units — each with its own
          sound and style.
        </p>
      </div>
      <div className="unit-grid">
        {subunits.map((u) => (
          <UnitCard key={u.name} u={u} />
        ))}
      </div>
    </section>
  )
}
