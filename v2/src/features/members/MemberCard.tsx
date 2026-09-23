import type { CSSProperties, Ref } from 'react'
import { memberAssets, type Member } from '../../content/members'
import { useT } from '../../i18n'

export function MemberCard({ member, onOpen, ref }: { member: Member; onOpen: () => void; ref?: Ref<HTMLButtonElement> }) {
  const t = useT()
  const a = memberAssets(member)
  return (
    <button
      ref={ref}
      type="button"
      onClick={onOpen}
      aria-label={t('members.open', { name: member.name })}
      style={{ '--c': member.color } as CSSProperties}
      className="group relative block aspect-[3/4] w-full overflow-hidden rounded-2xl border border-white/10 bg-sea-900 text-left"
    >
      <img src={a.portrait} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover object-top transition duration-500 group-hover:scale-105" />
      <span className="absolute inset-0 bg-gradient-to-t from-sea-950 via-sea-950/10 to-transparent" aria-hidden="true" />
      <span
        className="absolute inset-0 rounded-2xl opacity-0 shadow-[inset_0_0_0_1px_var(--c),0_0_40px_-8px_var(--c)] transition group-hover:opacity-100 group-focus-visible:opacity-100"
        aria-hidden="true"
      />
      <span className="absolute inset-x-3 bottom-3 flex items-center gap-2">
        <img src={a.emblem} alt="" className="size-7" />
        <span className="font-display text-lg">{member.name.split(' ')[0]}</span>
        <span className="ml-auto size-2 rounded-full bg-[var(--c)]" aria-hidden="true" />
      </span>
    </button>
  )
}
