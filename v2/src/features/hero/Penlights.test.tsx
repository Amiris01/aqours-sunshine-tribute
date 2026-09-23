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

it('sways with the crowd only while music is playing', async () => {
  const { usePlayer } = await import('../../store/player')
  const { act } = await import('@testing-library/react')
  usePlayer.getState().close()
  render(<Penlights />)
  const nav = screen.getByRole('navigation')
  expect(nav).toHaveAttribute('data-sway', 'false')
  act(() => {
    usePlayer.getState().playAt(0)
    usePlayer.getState().report({ position: 1, duration: 90, paused: false, buffering: false })
  })
  expect(nav).toHaveAttribute('data-sway', 'true')
  act(() => usePlayer.getState().close())
})

it('draws each penlight as a blade with a handle', () => {
  render(<Penlights />)
  expect(screen.getAllByTestId('blade')).toHaveLength(9)
  expect(screen.getAllByTestId('blade-handle')).toHaveLength(9)
})
