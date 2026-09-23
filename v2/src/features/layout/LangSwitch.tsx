import { useLang } from '../../store/lang'
import { useT } from '../../i18n'
import { prefersReducedMotion } from '../../lib/motionPref'
import type { Lang } from '../../content/types'

const OPTIONS: { lang: Lang; label: string }[] = [
  { lang: 'en', label: 'EN' },
  { lang: 'ja', label: '日本語' },
]

const FADE_MS = 140

/** Dip the page, swap the language while it's faint, then bring it back. */
function switchTo(lang: Lang) {
  const { lang: current, setLang } = useLang.getState()
  if (lang === current) return
  if (prefersReducedMotion()) return setLang(lang)
  const root = document.documentElement
  root.classList.add('lang-fade')
  window.setTimeout(() => {
    setLang(lang)
    requestAnimationFrame(() => root.classList.remove('lang-fade'))
  }, FADE_MS)
}

export function LangSwitch() {
  const t = useT()
  const lang = useLang((s) => s.lang)
  return (
    <div role="group" aria-label={t('lang.label')} className="flex rounded-[3px] border border-line p-0.5 text-sm">
      {OPTIONS.map((o) => (
        <button
          key={o.lang}
          type="button"
          aria-pressed={lang === o.lang}
          onClick={() => switchTo(o.lang)}
          className="rounded-[2px] px-2.5 py-1 text-haze transition hover:text-ink aria-pressed:bg-ink aria-pressed:text-night"
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
