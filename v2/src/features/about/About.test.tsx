import { render, screen } from '@testing-library/react'
import { About } from './About'
import { en } from '../../i18n/en'
import { useLang } from '../../store/lang'

it('renders the heading and the full lead text', () => {
  useLang.getState().setLang('en')
  render(<About />)
  expect(screen.getByRole('heading', { level: 2, name: en['about.h2'] })).toBeInTheDocument()
  expect(screen.getByTestId('about-lead').textContent).toBe(en['about.lead'])
})
