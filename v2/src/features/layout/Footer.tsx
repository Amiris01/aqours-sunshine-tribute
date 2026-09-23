import { members } from '../../content/members'
import { useT } from '../../i18n'

export function Footer() {
  const t = useT()
  return (
    <footer className="border-t border-line px-4 pb-36 pt-20">
      <div className="mx-auto max-w-6xl">
        {/* The house lights come up: all nine colours, one line. */}
        <div aria-hidden="true" className="flex h-1.5 overflow-hidden rounded-full">
          {members.map((m) => (
            <span key={m.num} className="flex-1" style={{ background: m.color }} />
          ))}
        </div>
        <p className="mt-12 font-display text-[clamp(3rem,10vw,7rem)] leading-none">{t('foot.mark')}</p>
        <p className="mt-4 text-lg">{t('foot.sub')}</p>
        <p className="mt-10 max-w-[60ch] text-sm leading-relaxed text-haze">{t('foot.note')}</p>
      </div>
    </footer>
  )
}
