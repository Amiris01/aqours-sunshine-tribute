import { useLang } from '../i18n/LanguageContext'

// Fixed top-right pill toggle between English and Japanese. Frosted-glass
// brand styling; the active language gets the mikan-orange fill.
const LANGS = [
  ['en', 'EN'],
  ['ja', '日本語'],
]

export default function LangSwitch() {
  const { lang, setLang, t } = useLang()
  return (
    <div className="lang-switch" role="group" aria-label={t('lang.switchTo')}>
      {LANGS.map(([code, label]) => (
        <button
          key={code}
          type="button"
          className={`lang-btn${lang === code ? ' on' : ''}`}
          onClick={() => setLang(code)}
          aria-pressed={lang === code}
          lang={code}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
