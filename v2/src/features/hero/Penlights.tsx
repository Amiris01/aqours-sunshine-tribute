import type { CSSProperties } from 'react'
import { members } from '../../content/members'
import { useT } from '../../i18n'
import { useMemberView } from '../../store/memberView'
import { usePlayer } from '../../store/player'
import { Blade } from './Blade'

// Slightly different angles, like a row of raised hands.
const TILTS = [-7, 4, -3, 6, -5, 3, -6, 5, -2]

/**
 * Nine Love Live! Blades in the members' image colours — what every Aqours crowd
 * holds up. Each opens that member's profile; together they sway while music plays.
 */
export function Penlights() {
  const t = useT()
  const playing = usePlayer((s) => s.status === 'playing')
  return (
    <nav
      aria-label={t('hero.penlights')}
      data-sway={playing ? 'true' : 'false'}
      className="relative z-10 mx-auto w-full max-w-6xl px-2 sm:px-4"
    >
      <ul className="grid grid-cols-9 items-end gap-0.5 sm:gap-3">
        {members.map((m, i) => {
          const first = m.name.split(' ')[0]!
          return (
            <li key={m.num} className="flex justify-center">
              <button
                type="button"
                aria-label={t('hero.penlight', { name: first })}
                onClick={(e) => useMemberView.getState().open(m.num, e.currentTarget)}
                className="group flex flex-col items-center gap-1 px-1 pb-3 pt-4 outline-offset-2"
              >
                <span
                  className="blade-sway block origin-bottom"
                  style={{ '--tilt': `${TILTS[i]}deg`, '--lean': `${TILTS[i]! > 0 ? -2 : 2}deg`, transform: `rotate(${TILTS[i]}deg)`, animationDelay: `${(i % 3) * -0.3}s` } as CSSProperties}
                >
                  <span className="block transition duration-200 group-hover:-translate-y-2 group-focus-visible:-translate-y-2">
                    <Blade color={m.color} className="h-24 w-auto transition-[filter] [--core:0.55] [--glow-far:12px] [--glow-near:7px] group-hover:[--core:0.95] group-hover:[--glow-far:30px] group-hover:[--glow-near:14px] group-focus-visible:[--core:0.95] group-focus-visible:[--glow-far:30px] group-focus-visible:[--glow-near:14px] sm:h-36" />
                  </span>
                </span>
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
