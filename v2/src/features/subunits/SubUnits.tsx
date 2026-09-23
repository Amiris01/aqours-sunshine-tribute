import type { CSSProperties } from 'react'
import { m as motion, type Variants } from 'motion/react'
import { subunits, type SubUnit } from '../../content/subunits'
import { memberAssets } from '../../content/members'
import { asset } from '../../lib/asset'
import { onColor } from '../../lib/color'
import { SectionHeading } from '../../lib/SectionHeading'
import { useT } from '../../i18n'
import { useMemberView } from '../../store/memberView'
import { DUR, EASE } from '../../motion/tokens'

// The trio steps up onto the stage once, the first time each unit scrolls into view.
const stage: Variants = { hidden: {}, shown: { transition: { staggerChildren: 0.09 } } }
const stepUp: Variants = {
  hidden: { opacity: 0, y: 36 },
  shown: { opacity: 1, y: 0, transition: { duration: DUR.slow, ease: EASE } },
}

function UnitStage({ unit, side }: { unit: SubUnit; side: 'left' | 'right' }) {
  const t = useT()
  const floorText = onColor(unit.color)
  // Accessible names come from the visible names inside the localised "Open …" phrase.
  const [before, after] = t('members.open', { name: '@@name@@' }).split('@@name@@')
  const text = (
    <div className="pb-4 pt-10 md:pb-28 md:pt-14">
      <h3>
        <span className="inline-flex rounded-[3px] bg-white px-4 py-3">
          <img src={asset(unit.logo)} alt={unit.name} className="h-11 w-auto md:h-12" />
        </span>
      </h3>
      <p className="mt-6 max-w-[40ch] text-lg leading-relaxed md:text-xl">{t(`subunit.tagline.${unit.name}`)}</p>
      {/* Their debut, read like a line on a setlist. */}
      <div className="mt-8 border-t border-line pt-4">
        <p className="flex flex-wrap items-baseline gap-x-4 font-led text-haze">
          <span>{t('subunits.single', { n: String(unit.firstSingle.no) })}</span>
          <span>{unit.firstSingle.date}</span>
        </p>
        <p className="mt-1 text-xl font-bold">{unit.firstSingle.title}</p>
      </div>
    </div>
  )
  const trio = (
    <motion.ul
      variants={stage}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount: 0.35 }}
      className="relative z-10 flex items-end justify-center self-end"
    >
      {unit.members.map((m) => {
        const [first, ...rest] = m.name.split(' ')
        return (
          <motion.li key={m.num} variants={stepUp} className="-mx-[4%] min-w-0 flex-1 md:-mx-[9%]">
            <button
              type="button"
              onClick={(e) => useMemberView.getState().open(m.num, e.currentTarget)}
              className="group flex w-full flex-col items-center outline-offset-4"
            >
              <img
                src={memberAssets(m).portrait}
                alt=""
                loading="lazy"
                className="aspect-square w-full object-contain object-bottom transition duration-300 group-hover:-translate-y-2 group-focus-visible:-translate-y-2"
              />
              {/* Her penlight, glowing at her feet on the stage floor. */}
              <span
                aria-hidden="true"
                className="-mt-2 block h-1.5 w-2/3 rounded-full opacity-80 transition duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
                style={{ background: m.color, boxShadow: `0 0 18px 4px ${m.color}` }}
              />
              <span className="mt-3 flex h-16 flex-col items-center justify-start text-center leading-tight md:h-20" style={{ color: floorText }}>
                {before && <><span className="sr-only">{before.trim()}</span>{' '}</>}
                <span className="font-display text-base md:text-lg">{first}</span>{' '}
                <span className="text-xs md:text-sm">{rest.join(' ')}</span>
                {after && <span className="sr-only">{after}</span>}
              </span>
            </button>
          </motion.li>
        )
      })}
    </motion.ul>
  )
  return (
    <article
      data-side={side}
      style={{ '--u': unit.color } as CSSProperties}
      className="relative overflow-hidden bg-deep"
    >
      {/* Spotlight on the trio, then the stage floor in the unit's colour. */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0 w-full md:w-1/2 ${side === 'right' ? 'right-0' : 'left-0'}`}
        style={{ background: `radial-gradient(60% 80% at 50% 100%, color-mix(in oklch, ${unit.color} 38%, transparent), transparent 70%)` }}
      />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-20 bg-[var(--u)] md:h-24" />
      <div className="relative mx-auto grid max-w-6xl gap-2 px-4 md:grid-cols-2 md:gap-12">
        {side === 'right' ? (
          <>
            {text}
            {trio}
          </>
        ) : (
          <>
            <div className="md:order-2">{text}</div>
            <div className="flex md:order-1">{trio}</div>
          </>
        )}
      </div>
    </article>
  )
}

/** Each unit on its own stage: the trio in its colour, and the single it debuted with. */
export function SubUnits() {
  return (
    <section id="units" className="scroll-mt-20 py-28">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading title="subunits.h2" lead="subunits.lead" />
      </div>
      <div className="mt-12 space-y-2">
        {subunits.map((u, i) => (
          <UnitStage key={u.name} unit={u} side={i % 2 === 0 ? 'right' : 'left'} />
        ))}
      </div>
    </section>
  )
}
