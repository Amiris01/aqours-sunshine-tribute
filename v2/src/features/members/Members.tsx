import { useRef, useState } from 'react'
import { members } from '../../content/members'
import { useT } from '../../i18n'
import { MemberCard } from './MemberCard'
import { MemberView } from './MemberView'

export function Members() {
  const t = useT()
  const [openNum, setOpenNum] = useState<string | null>(null)
  const cardRefs = useRef(new Map<string, HTMLButtonElement>())

  return (
    <section id="members" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-28">
      <p className="text-xs uppercase tracking-[0.25em] text-aqua">{t('members.eyebrow')}</p>
      <h2 className="mt-4 font-display text-4xl md:text-6xl">{t('members.h2')}</h2>
      <p className="mt-4 max-w-2xl text-mist">{t('members.lead')}</p>
      <ul className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {members.map((m) => (
          <li key={m.num}>
            <MemberCard
              member={m}
              onOpen={() => setOpenNum(m.num)}
              ref={(el) => {
                if (el) cardRefs.current.set(m.num, el)
                else cardRefs.current.delete(m.num)
              }}
            />
          </li>
        ))}
      </ul>
      <MemberView
        num={openNum}
        onNavigate={setOpenNum}
        onClose={() => setOpenNum(null)}
        returnFocus={(num) => cardRefs.current.get(num)?.focus()}
      />
    </section>
  )
}
