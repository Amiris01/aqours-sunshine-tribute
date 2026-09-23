import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SubUnits } from './SubUnits'
import { useLang } from '../../store/lang'
import { useMemberView } from '../../store/memberView'

beforeEach(() => {
  useLang.getState().setLang('en')
  useMemberView.getState().close()
})

const unit = (name: string) => screen.getByRole('img', { name }).closest('article')!

it('puts each unit trio on its own stage with tagline and members', () => {
  render(<SubUnits />)
  expect(screen.getAllByRole('article')).toHaveLength(3)
  const azalea = unit('AZALEA')
  expect(azalea).toHaveTextContent('Cool, composed, and effortlessly elegant.')
  const trio = within(azalea).getAllByRole('button')
  expect(trio.map((b) => b.textContent)).toEqual(
    expect.arrayContaining([expect.stringContaining('Kanan'), expect.stringContaining('Dia'), expect.stringContaining('Hanamaru')]),
  )
  expect(trio).toHaveLength(3)
})

it('lists each unit\'s verified first single, setlist-style', () => {
  render(<SubUnits />)
  expect(unit('CYaRon!')).toHaveTextContent('Unit Single 1')
  expect(unit('CYaRon!')).toHaveTextContent('Genki Zenkai DAY! DAY! DAY!')
  expect(unit('CYaRon!')).toHaveTextContent('2016.05.11')
  expect(unit('AZALEA')).toHaveTextContent('Torikoriko PLEASE!!')
  expect(unit('AZALEA')).toHaveTextContent('2016.05.25')
  expect(unit('Guilty Kiss')).toHaveTextContent('Strawberry Trapper')
  expect(unit('Guilty Kiss')).toHaveTextContent('2016.06.08')
})

it('opens a member profile from the stage and remembers where to return focus', async () => {
  render(<SubUnits />)
  const riko = within(unit('Guilty Kiss')).getByRole('button', { name: /Riko Sakurauchi/ })
  await userEvent.click(riko)
  expect(useMemberView.getState().openNum).toBe('02')
  expect(useMemberView.getState().opener).toBe(riko)
})

it('alternates the stage side from unit to unit', () => {
  render(<SubUnits />)
  expect(screen.getAllByRole('article').map((a) => a.dataset.side)).toEqual(['right', 'left', 'right'])
})
