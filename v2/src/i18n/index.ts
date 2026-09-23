import { useCallback } from 'react'
import { en, type Dict, type Key } from './en'
import { ja } from './ja'
import { useLang } from '../store/lang'
import type { Lang } from '../content/types'

export type { Key }
export const dict: Record<Lang, Dict> = { en, ja }

export function format(s: string, vars?: Record<string, string>): string {
  if (!vars) return s
  return s.replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? `{${k}}`)
}

export function useT() {
  const lang = useLang((s) => s.lang)
  return useCallback((key: Key, vars?: Record<string, string>) => format(dict[lang][key], vars), [lang])
}
