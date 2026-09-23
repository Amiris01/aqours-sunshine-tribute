import { render, screen } from '@testing-library/react'
import { About } from './About'
import { en } from '../../i18n/en'
import { useLang } from '../../store/lang'

it('renders the statement without the "Where it began" route', () => {
  useLang.getState().setLang('en')
  render(<About />)
  expect(screen.getByRole('heading', { level: 2, name: en['about.h2'] })).toBeInTheDocument()
  expect(screen.getByTestId('about-lead').textContent).toBe(en['about.lead'])
  expect(screen.queryByText('Where it began')).not.toBeInTheDocument()
  expect(screen.queryByRole('list')).not.toBeInTheDocument()
})
