import { render, screen, within } from '@testing-library/react'
import { SubUnits } from './SubUnits'
import { useLang } from '../../store/lang'

it('renders three units with their members and taglines', () => {
  useLang.getState().setLang('en')
  render(<SubUnits />)
  const units = screen.getAllByRole('article')
  expect(units).toHaveLength(3)
  for (const u of units) expect(within(u).getAllByRole('listitem')).toHaveLength(3)
  const azalea = screen.getByRole('img', { name: 'AZALEA' }).closest('article')!
  expect(azalea).toHaveTextContent('Kanan Matsuura')
  expect(azalea).toHaveTextContent('Cool, composed, and effortlessly elegant.')
})
