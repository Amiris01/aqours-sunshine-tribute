import { lazy, Suspense, useRef } from 'react'
import { m as motion, type Variants } from 'motion/react'
import { DUR, EASE } from '../../motion/tokens'
import { members } from '../../content/members'
import { SectionHeading } from '../../lib/SectionHeading'
import { ErrorBoundary } from '../../lib/ErrorBoundary'
import { useMemberView } from '../../store/memberView'
import { MemberCard } from './MemberCard'

// The nine tickets are dealt onto the table once, when the section first comes into view.
const deal: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.06 } },
}
const ticket: Variants = {
  hidden: { opacity: 0, y: 18, rotate: -1.5 },
  shown: { opacity: 1, y: 0, rotate: 0, transition: { duration: DUR.slow, ease: EASE } },
}

// Radix Dialog + the view only load once a member is first opened.
const MemberView = lazy(() => import('./MemberView').then((mod) => ({ default: mod.MemberView })))

export function Members() {
  const openNum = useMemberView((s) => s.openNum)
  const cardRefs = useRef(new Map<string, HTMLButtonElement>())
  const everOpened = useRef(false)
  if (openNum) everOpened.current = true

  // Return focus to whatever opened the view (a hero penlight), else her ticket.
  const returnFocus = (num: string) => {
    const opener = useMemberView.getState().opener
    ;(opener?.isConnected ? opener : cardRefs.current.get(num))?.focus()
  }

  return (
    <section id="members" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-28">
      <SectionHeading title="members.h2" lead="members.lead" />
      <motion.ul
        variants={deal}
        initial="hidden"
        whileInView="shown"
        viewport={{ once: true, amount: 0.2 }}
        className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {members.map((m) => (
          <motion.li key={m.num} variants={ticket}>
            <MemberCard
              member={m}
              onOpen={() => useMemberView.getState().open(m.num)}
              ref={(el) => {
                if (el) cardRefs.current.set(m.num, el)
                else cardRefs.current.delete(m.num)
              }}
            />
          </motion.li>
        ))}
      </motion.ul>
      {everOpened.current && (
        <ErrorBoundary fallback={null}>
          <Suspense fallback={null}>
            <MemberView
              num={openNum}
              onNavigate={(num) => useMemberView.getState().navigate(num)}
              onClose={() => useMemberView.getState().close()}
              returnFocus={returnFocus}
            />
          </Suspense>
        </ErrorBoundary>
      )}
    </section>
  )
}
