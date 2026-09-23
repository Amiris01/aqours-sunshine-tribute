import { useLang } from '../../store/lang'
import { useT } from '../../i18n'
import type { Lang } from '../../content/types'

const OPTIONS: { lang: Lang; label: string }[] = [
  { lang: 'en', label: 'EN' },
  { lang: 'ja', label: '日本語' },
]

export function LangSwitch() {
  const t = useT()
  const { lang, setLang } = useLang()
  return (
    <div role="group" aria-label={t('lang.label')} className="flex rounded-full border border-white/10 bg-white/5 p-0.5 text-xs">
      {OPTIONS.map((o) => (
        <button
          key={o.lang}
          type="button"
          aria-pressed={lang === o.lang}
          onClick={() => setLang(o.lang)}
          className="rounded-full px-3 py-1.5 font-semibold text-mist transition aria-pressed:bg-aqua aria-pressed:text-sea-950"
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
