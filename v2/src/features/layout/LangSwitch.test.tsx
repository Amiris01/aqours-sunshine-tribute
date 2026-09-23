import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LangSwitch } from './LangSwitch'
import { useLang } from '../../store/lang'

beforeEach(() => useLang.getState().setLang('en'))

it('cross-fades the page, then switches language', async () => {
  render(<LangSwitch />)
  expect(screen.getByRole('button', { name: 'EN' })).toHaveAttribute('aria-pressed', 'true')
  await userEvent.click(screen.getByRole('button', { name: '日本語' }))
  expect(document.documentElement.classList.contains('lang-fade')).toBe(true)
  await waitFor(() => expect(useLang.getState().lang).toBe('ja'))
  await waitFor(() => expect(document.documentElement.classList.contains('lang-fade')).toBe(false))
  expect(screen.getByRole('button', { name: '日本語' })).toHaveAttribute('aria-pressed', 'true')
})

it('switches instantly under reduced motion', async () => {
  const original = window.matchMedia
  window.matchMedia = ((q: string) => ({ ...original(q), matches: q.includes('reduce') })) as typeof window.matchMedia
  try {
    render(<LangSwitch />)
    await userEvent.click(screen.getByRole('button', { name: '日本語' }))
    expect(useLang.getState().lang).toBe('ja')
    expect(document.documentElement.classList.contains('lang-fade')).toBe(false)
  } finally {
    window.matchMedia = original
  }
})
