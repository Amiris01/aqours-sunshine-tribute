import { lazy, Suspense, useRef } from 'react'
import { members } from '../../content/members'
import { SectionHeading } from '../../lib/SectionHeading'
import { ErrorBoundary } from '../../lib/ErrorBoundary'
import { useMemberView } from '../../store/memberView'
import { MemberCard } from './MemberCard'

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
      <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((m) => (
          <li key={m.num}>
            <MemberCard
              member={m}
              onOpen={() => useMemberView.getState().open(m.num)}
              ref={(el) => {
                if (el) cardRefs.current.set(m.num, el)
                else cardRefs.current.delete(m.num)
              }}
            />
          </li>
        ))}
      </ul>
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
