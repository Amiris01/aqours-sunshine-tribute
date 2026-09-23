export type Lang = 'en' | 'ja'
export type Localized = Record<Lang, string>
export const pick = (l: Localized, lang: Lang): string => l[lang]
