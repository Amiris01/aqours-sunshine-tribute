import { useT } from '../../i18n'
import { usePlayer } from '../../store/player'

// Mounted from page load (unlike the lazy Player) so screen readers already know the
// live region when the first track starts, and announce it.
export function NowPlayingAnnouncer() {
  const t = useT()
  const title = usePlayer((s) => (s.index >= 0 ? s.queue[s.index]?.title : undefined))
  return (
    <div role="status" aria-live="polite" className="sr-only" data-testid="np-announcer">
      {title ? `${t('np.nowPlaying')}: ${title}` : ''}
    </div>
  )
}
