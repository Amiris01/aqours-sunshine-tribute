import { dict, useT, type Key } from '../i18n'
import { useLang } from '../store/lang'

/**
 * Section title in poster type, with the same title in the other language set
 * small beneath it — the bilingual line-up you see on Japanese concert print.
 */
export function SectionHeading({ title, lead }: { title: Key; lead?: Key }) {
  const t = useT()
  const lang = useLang((s) => s.lang)
  const other = lang === 'en' ? 'ja' : 'en'
  return (
    <header className="max-w-3xl">
      <h2 className="font-display text-[clamp(2.1rem,5.5vw,4rem)] leading-[1.08]">{t(title)}</h2>
      <p lang={other} className="mt-2 text-haze">{dict[other][title]}</p>
      {lead && <p className="mt-6 max-w-[60ch] text-lg leading-relaxed">{t(lead)}</p>}
    </header>
  )
}
