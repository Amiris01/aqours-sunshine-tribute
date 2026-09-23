import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LangSwitch } from './LangSwitch'
import { useLang } from '../../store/lang'

beforeEach(() => useLang.getState().setLang('en'))

it('toggles language', async () => {
  render(<LangSwitch />)
  expect(screen.getByRole('button', { name: 'EN' })).toHaveAttribute('aria-pressed', 'true')
  await userEvent.click(screen.getByRole('button', { name: '日本語' }))
  expect(useLang.getState().lang).toBe('ja')
  expect(screen.getByRole('button', { name: '日本語' })).toHaveAttribute('aria-pressed', 'true')
})
