import type { CSSProperties } from 'react'
import { members } from '../../content/members'
import { useT } from '../../i18n'
import { useMemberView } from '../../store/memberView'

/**
 * Nine penlights in the members' image colours — the thing every Aqours crowd
 * holds up. Each one opens that member's profile.
 */
export function Penlights() {
  const t = useT()
  return (
    <nav aria-label={t('hero.penlights')} className="relative z-10 mx-auto w-full max-w-6xl px-4">
      <ul className="grid grid-cols-9 gap-1 sm:gap-3">
        {members.map((m) => {
          const first = m.name.split(' ')[0]!
          return (
            <li key={m.num}>
              <button
                type="button"
                aria-label={t('hero.penlight', { name: first })}
                onClick={(e) => useMemberView.getState().open(m.num, e.currentTarget)}
                style={{ '--c': m.color } as CSSProperties}
                className="group flex w-full flex-col items-center gap-2 pb-4 pt-2 outline-offset-0"
              >
                <span
                  aria-hidden="true"
                  className="block h-14 w-2 rounded-full bg-[var(--c)] opacity-70 shadow-[0_0_14px_2px_var(--c)] transition duration-200 group-hover:-translate-y-1 group-hover:opacity-100 group-hover:shadow-[0_0_28px_6px_var(--c)] group-focus-visible:opacity-100 sm:h-20 sm:w-2.5"
                />
                <span aria-hidden="true" className="hidden text-xs text-haze transition group-hover:text-ink sm:block">
                  {first}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
