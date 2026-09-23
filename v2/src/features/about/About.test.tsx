import { render, screen } from '@testing-library/react'
import { About } from './About'
import { en } from '../../i18n/en'
import { useLang } from '../../store/lang'

it('renders the statement and where Aqours began', () => {
  useLang.getState().setLang('en')
  render(<About />)
  expect(screen.getByRole('heading', { level: 2, name: en['about.h2'] })).toBeInTheDocument()
  expect(screen.getByTestId('about-lead').textContent).toBe(en['about.lead'])
  const route = screen.getByRole('list', { name: en['about.whereLabel'] })
  expect(route).toHaveTextContent("Uranohoshi Girls' High School")
  expect(route).toHaveTextContent('Shizuoka')
  expect(screen.getByText(/Step! ZERO to ONE/)).toBeInTheDocument()
})
