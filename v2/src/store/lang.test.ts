import { vi } from 'vitest'

afterEach(() => {
  vi.restoreAllMocks()
  vi.resetModules()
  localStorage.clear()
})

it('reads and persists the language', async () => {
  localStorage.setItem('aqours-v2-lang', 'ja')
  const { useLang } = await import('./lang')
  expect(useLang.getState().lang).toBe('ja')
  useLang.getState().setLang('en')
  expect(localStorage.getItem('aqours-v2-lang')).toBe('en')
  expect(document.documentElement.lang).toBe('en')
})

it('falls back to EN and still switches when storage throws', async () => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('blocked')
  })
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('blocked')
  })
  const { useLang } = await import('./lang')
  expect(useLang.getState().lang).toBe('en')
  expect(() => useLang.getState().setLang('ja')).not.toThrow()
  expect(useLang.getState().lang).toBe('ja')
})
