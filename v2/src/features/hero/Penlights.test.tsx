import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Penlights } from './Penlights'
import { useMemberView } from '../../store/memberView'
import { useLang } from '../../store/lang'

beforeEach(() => {
  useLang.getState().setLang('en')
  useMemberView.getState().close()
})

it('shows nine penlights in member order that open that member', async () => {
  render(<Penlights />)
  const lights = screen.getAllByRole('button')
  expect(lights).toHaveLength(9)
  expect(lights[0]).toHaveAccessibleName("Chika: open profile")
  await userEvent.click(screen.getByRole('button', { name: 'Riko: open profile' }))
  expect(useMemberView.getState().openNum).toBe('02')
  expect(useMemberView.getState().opener).toBe(screen.getByRole('button', { name: 'Riko: open profile' }))
})
