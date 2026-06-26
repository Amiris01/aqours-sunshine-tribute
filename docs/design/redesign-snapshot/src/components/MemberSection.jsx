import { forwardRef } from 'react'
import { useReveal } from '../hooks'

const PROFILE_FIELDS = [
  ['Voice (CV)', 'cv'],
  ['Birthday', 'birthday'],
  ['Zodiac', 'zodiac'],
  ['Grade', 'grade'],
  ['Age', 'age'],
  ['Height', 'height'],
  ['Blood Type', 'blood'],
  ['Trademark', 'trademark'],
]

// Editorial pacing: each band's composition is chosen by index so the long
// scroll alternates tight / wide / full-bleed "flood" instead of nine
// identical mirror bands. Chika (00) opens as the featured flood lead.
const VARIANTS = ['flood', 'wide', 'tight', 'wide', 'flood', 'tight', 'wide', 'flood', 'wide']

/**
 * A full-width member profile band, themed to the member's image color via the
 * `--c` custom property. An oversized numeral bleeds off the leading edge and
 * the emblem becomes a large watermark; layout density varies by `variant`.
 * The outer <section> ref is forwarded for the spine/tab active state and
 * smooth-scroll targets.
 */
const MemberSection = forwardRef(function MemberSection({ m, idx }, sectionRef) {
  const [revealRef, shown] = useReveal()
  const variant = VARIANTS[idx % VARIANTS.length]

  // Combine the forwarded ref (for scroll/observe) with the reveal ref.
  const setRefs = (node) => {
    revealRef.current = node
    if (typeof sectionRef === 'function') sectionRef(node)
    else if (sectionRef) sectionRef.current = node
  }

  return (
    <section
      ref={setRefs}
      id={`member-${idx}`}
      data-idx={idx}
      className={`msec ${variant}${m.flip ? ' flip' : ''} reveal${shown ? ' in' : ''}`}
      style={{ '--c': m.color }}
    >
      <span className="bignum" aria-hidden="true">{m.num}</span>
      {m.emblem && <img className="watermark" src={m.emblem} alt="" aria-hidden="true" />}

      <div className="mwrap">
        <div className="media">
          <div className="portrait">
            <span className="num" aria-hidden="true">{m.num}</span>
            <div className="glow" />
            {m.portrait ? (
              <img className="portrait-img" src={m.portrait} alt={m.name} />
            ) : (
              <>
                <div className="sil-body" />
                <div className="sil-head" />
              </>
            )}
          </div>
          {m.emblem ? (
            <img className="emblem-badge" src={m.emblem} alt={`${m.name} emblem`} />
          ) : (
            <div className="slot emblem-badge" style={{ width: 'auto', padding: '6px 10px' }}>
              {m.logoLabel}
            </div>
          )}
        </div>

        <div className="minfo">
          <div className="m-index">Member {m.num}</div>
          <h3 className="m-name">{m.name}</h3>
          <div className="m-jp">{m.jp}</div>
          <div className="chips">
            <span className="chip unit">{m.unit}</span>
            <span className="chip oshi">
              <span className="swatch" />
              {m.colorName}
            </span>
          </div>
          <p className="m-blurb">{m.blurb}</p>
          <div className="pgrid">
            {PROFILE_FIELDS.map(([label, key]) => (
              <div className="pcell" key={key}>
                <div className="plabel">{label}</div>
                <div className="pval">{m[key]}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
})

export default MemberSection
