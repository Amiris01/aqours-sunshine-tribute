import type { Lang } from '../content/types'

/** Word-ish segments (keeps whitespace/punctuation) so JA text without spaces still splits. */
export function segmentWords(text: string, lang: Lang): string[] {
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const seg = new Intl.Segmenter(lang, { granularity: 'word' })
    return Array.from(seg.segment(text), (s) => s.segment)
  }
  return text.split(/(\s+)/)
}
