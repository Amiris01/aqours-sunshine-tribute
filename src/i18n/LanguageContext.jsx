import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { translations } from './translations'

const STORAGE_KEY = 'aqours-lang'
const SUPPORTED = ['en', 'ja']
const DEFAULT_LANG = 'en'
// Crossfade timing: content fades out, text swaps at the trough, fades back in.
const FADE_MS = 220

const LanguageContext = createContext(null)

function readInitialLang() {
  if (typeof window === 'undefined') return DEFAULT_LANG
  const saved = window.localStorage.getItem(STORAGE_KEY)
  return SUPPORTED.includes(saved) ? saved : DEFAULT_LANG
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(readInitialLang)
  // True while a crossfade is mid-flight; consumed by the page to fade content.
  const [switching, setSwitching] = useState(false)
  const timers = useRef([])

  // Persist choice + keep <html lang> and the document title in sync for
  // accessibility / typography / browser-tab labeling.
  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, lang)
    document.documentElement.lang = lang
    const dict = translations[lang] || translations[DEFAULT_LANG]
    const title = dict['meta.title'] || translations[DEFAULT_LANG]['meta.title']
    if (title) document.title = title
  }, [lang])

  // Clear any pending fade timers on unmount.
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const setLang = useCallback(
    (next) => {
      if (!SUPPORTED.includes(next) || next === lang) return

      // Respect reduced-motion: swap instantly, no fade.
      const reduce =
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduce) {
        setLangState(next)
        return
      }

      timers.current.forEach(clearTimeout)
      timers.current = []
      // Fade out, swap text at the trough, then fade back in.
      setSwitching(true)
      timers.current.push(
        setTimeout(() => setLangState(next), FADE_MS),
        setTimeout(() => setSwitching(false), FADE_MS + 20)
      )
    },
    [lang]
  )

  // Translate a key for the current language; fall back to EN, then the key.
  const t = useCallback(
    (key, vars) => {
      const dict = translations[lang] || translations[DEFAULT_LANG]
      let str = dict[key] ?? translations[DEFAULT_LANG][key] ?? key
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          str = str.replace(`{${k}}`, v)
        }
      }
      return str
    },
    [lang]
  )

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, switching }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLang must be used within a LanguageProvider')
  return ctx
}
