import { forwardRef } from 'react'
import { asset } from '../assets'
import { useReveal } from '../hooks'
import { useLang } from '../i18n/LanguageContext'

// [translation key, member data key]. Labels are localized via t(); the values
// (CV, birthday, height, …) stay in their source form per the design scope.
const PROFILE_FIELDS = [
  ['profile.cv', 'cv'],
  ['profile.birthday', 'birthday'],
  ['profile.zodiac', 'zodiac'],
  ['profile.grade', 'grade'],
  ['profile.age', 'age'],
  ['profile.height', 'height'],
  ['profile.blood', 'blood'],
  ['profile.trademark', 'trademark'],
]

// Full-art character banners (cinematic backdrop per band). Derived in the
// view layer from member number — keeps data.js untouched.
const BANNERS = {
  '01': '01-chika',
  '02': '02-riko',
  '03': '03-kanan',
  '04': '04-dia',
  '05': '05-you',
  '06': '06-yoshiko',
  '07': '07-hanamaru',
  '08': '08-mari',
  '09': '09-ruby',
}

// Info card side, strictly alternating R/L down the page. The artwork is
// biased to the opposite side so the character's face stays clear. View-layer.
const CARD_SIDE = {
  '01': 'right', // Chika
  '02': 'left', // Riko
  '03': 'right', // Kanan
  '04': 'left', // Dia
  '05': 'right', // You
  '06': 'right', // Yoshiko
  '07': 'left', // Hanamaru
  '08': 'left', // Mari
  '09': 'right', // Ruby
}

/**
 * A full-width member profile band, themed to the member's image color via
 * the `--c` custom property, alternating card side L/R. In `showcase` mode the
 * MemberShowcase wrapper controls the band's visibility (pinned slideshow);
 * otherwise it reveals on scroll. The outer <section> ref is forwarded.
 */
const MemberSection = forwardRef(function MemberSection({ m, idx, showcase = false }, sectionRef) {
  const [revealRef, shown] = useReveal()
  const { t } = useLang()
  const banner = BANNERS[m.num] ? asset(`assets/banner/${BANNERS[m.num]}.webp`) : null
  const sign = BANNERS[m.num] ? asset(`assets/sign/${BANNERS[m.num]}-sign.webp`) : null
  const cardSide = CARD_SIDE[m.num] || (m.flip ? 'right' : 'left')

  // Combine the forwarded ref (for scroll/observe) with the reveal ref.
  const setRefs = (node) => {
    revealRef.current = node
    if (typeof sectionRef === 'function') sectionRef(node)
    else if (sectionRef) sectionRef.current = node
  }

  return (
    <section
      ref={setRefs}
      data-idx={idx}
      className={`msec${showcase ? ' showcase-slide' : ` reveal${shown ? ' in' : ''}`}${banner ? ' has-banner' : ''} card-${cardSide}`}
      style={{ '--c': m.color }}
    >
      {banner && (
        <>
          <div
            className="msec-banner"
            style={{ backgroundImage: `url(${banner})` }}
            role="img"
            aria-label={`${m.name} feature artwork`}
          />
          <div className="msec-scrim" />
        </>
      )}
      <div className="mwrap">
        <div className="minfo">
          <div className="m-index">
            <span className="m-index-unit">{m.unit}</span>
          </div>
          <h3 className="m-name">{m.name}</h3>
          <div className="m-jp">{m.jp}</div>
          <div className="m-color">
            <span className="m-color-dot" />
            {m.colorName}
          </div>
          <p className="m-blurb">{t(`blurb.${m.num}`)}</p>
          <div className="pgrid">
            {PROFILE_FIELDS.map(([label, key]) => (
              <div className="pcell" key={key}>
                <div className="plabel">{t(label)}</div>
                <div className="pval">{m[key]}</div>
              </div>
            ))}
          </div>
          {sign && (
            <div className="m-sign-wrap">
              <img className="m-sign" src={sign} alt={`${m.name} signature`} loading="lazy" />
            </div>
          )}
        </div>
      </div>
    </section>
  )
})

export default MemberSection
