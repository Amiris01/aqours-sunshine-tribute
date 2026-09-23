import { useShallow } from 'zustand/react/shallow'
import { useT, type Key } from '../../i18n'
import { usePlayer } from '../../store/player'
import { LangSwitch } from './LangSwitch'

const LINKS: { href: string; key: Key }[] = [
  { href: '#members', key: 'nav.members' },
  { href: '#units', key: 'nav.units' },
  { href: '#music', key: 'nav.music' },
  { href: '#journey', key: 'nav.journey' },
]

export function TopBar() {
  const t = useT()
  const { track, minimized, playing, accent } = usePlayer(
    useShallow((s) => {
      const track = s.index >= 0 ? s.queue[s.index] : undefined
      return { track, minimized: s.minimized, playing: s.status === 'playing', accent: track?.accent }
    }),
  )
  return (
    <header className="fixed inset-x-0 top-0 z-30 border-b border-line bg-night/95">
      <nav className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
        <a href="#top" aria-label={t('nav.home')} className="font-display text-lg">
          Aqours
        </a>
        <ul className="ml-8 hidden gap-7 text-sm text-haze md:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="transition hover:text-ink">{t(l.key)}</a>
            </li>
          ))}
        </ul>
        <div className="ml-auto flex items-center gap-3">
          {track && minimized && (
            <button
              type="button"
              data-np-pill
              onClick={() => usePlayer.getState().setMinimized(false)}
              aria-label={`${t('np.expand')}: ${track.title}`}
              className="flex max-w-40 items-center gap-2 rounded-[3px] border border-line px-3 py-1.5 text-sm hover:border-ink sm:max-w-60"
            >
              <span
                aria-hidden="true"
                className={`size-2 shrink-0 rounded-full ${playing ? 'motion-safe:animate-pulse' : 'opacity-50'}`}
                style={{ background: accent }}
              />
              <span className="truncate">{track.title}</span>
            </button>
          )}
          <LangSwitch />
        </div>
      </nav>
    </header>
  )
}
