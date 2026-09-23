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
    <div role="group" aria-label={t('lang.label')} className="flex rounded-[3px] border border-line p-0.5 text-sm">
      {OPTIONS.map((o) => (
        <button
          key={o.lang}
          type="button"
          aria-pressed={lang === o.lang}
          onClick={() => setLang(o.lang)}
          className="rounded-[2px] px-2.5 py-1 text-haze transition hover:text-ink aria-pressed:bg-ink aria-pressed:text-night"
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
