import type { CSSProperties, Ref } from 'react'
import { memberAssets, type Member } from '../../content/members'
import { onColor } from '../../lib/color'
import { useT } from '../../i18n'

/**
 * A ticket: portrait on the left, a stub in her image colour on the right,
 * torn along a perforation. Her member number is the seat.
 */
export function MemberCard({ member, onOpen, ref }: { member: Member; onOpen: () => void; ref?: Ref<HTMLButtonElement> }) {
  const t = useT()
  const a = memberAssets(member)
  const [first, ...rest] = member.name.split(' ')
  return (
    <button
      ref={ref}
      type="button"
      onClick={onOpen}
      aria-label={t('members.open', { name: member.name })}
      style={{ '--c': member.color, '--on-c': onColor(member.color) } as CSSProperties}
      className="group relative flex h-44 w-full overflow-hidden rounded-[6px] bg-deep text-left transition duration-200 hover:-translate-y-0.5"
    >
      <span className="relative block h-full flex-1 overflow-hidden bg-[color-mix(in_oklab,var(--c)_22%,var(--color-deep))]">
        <img src={a.portrait} alt="" loading="lazy" className="absolute inset-x-0 top-0 h-[150%] w-full object-cover object-top transition duration-500 group-hover:scale-[1.04]" />
      </span>
      {/* Perforation: dashed tear line with the two punched notches. */}
      <span aria-hidden="true" className="relative w-0 border-l-2 border-dashed border-night/40">
        <span className="absolute -left-2.5 -top-2.5 size-5 rounded-full bg-night" />
        <span className="absolute -bottom-2.5 -left-2.5 size-5 rounded-full bg-night" />
      </span>
      <span className="flex w-[46%] flex-col justify-between bg-[var(--c)] p-4 text-[var(--on-c)]">
        <span className="font-led text-lg leading-none">No.{member.num}</span>
        <span>
          <span className="block font-display text-xl leading-none lg:text-[1.35rem]">{first}</span>
          <span className="mt-1 block text-sm leading-tight">{rest.join(' ')}</span>
        </span>
        <span className="text-xs">{member.unit}</span>
      </span>
    </button>
  )
}
