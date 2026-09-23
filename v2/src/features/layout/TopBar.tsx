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
  const { track, minimized, playing } = usePlayer(
    useShallow((s) => ({ track: s.index >= 0 ? s.queue[s.index] : undefined, minimized: s.minimized, playing: s.status === 'playing' })),
  )
  return (
    <header className="fixed inset-x-0 top-0 z-30 border-b border-white/5 bg-sea-950/60 backdrop-blur-lg">
      <nav className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
        <a href="#top" aria-label={t('nav.home')} className="font-display text-lg font-semibold tracking-tight">
          Aqours<span className="text-aqua">.</span>
        </a>
        <ul className="ml-6 hidden gap-6 text-sm text-mist md:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="transition hover:text-ink">{t(l.key)}</a>
            </li>
          ))}
        </ul>
        <div className="ml-auto flex items-center gap-2">
          {track && minimized && (
            <button
              type="button"
              data-np-pill
              onClick={() => usePlayer.getState().setMinimized(false)}
              aria-label={`${t('np.expand')}: ${track.title}`}
              className="flex max-w-40 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs sm:max-w-56"
            >
              <span className={playing ? 'animate-pulse text-aqua' : 'text-mist'} aria-hidden="true">♪</span>
              <span className="truncate">{track.title}</span>
            </button>
          )}
          <LangSwitch />
        </div>
      </nav>
    </header>
  )
}
