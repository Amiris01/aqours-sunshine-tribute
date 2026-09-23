import { create } from 'zustand'
import type { Lang } from '../content/types'

const KEY = 'aqours-v2-lang'

function readInitial(): Lang {
  try {
    return localStorage.getItem(KEY) === 'ja' ? 'ja' : 'en'
  } catch {
    return 'en' // storage blocked (private mode etc.)
  }
}

interface LangState {
  lang: Lang
  setLang(lang: Lang): void
}

export const useLang = create<LangState>()((set) => ({
  lang: readInitial(),
  setLang(lang) {
    try {
      localStorage.setItem(KEY, lang)
    } catch {
      /* storage blocked — keep in memory only */
    }
    document.documentElement.lang = lang
    set({ lang })
  },
}))
