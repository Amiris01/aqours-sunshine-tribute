import { render, screen } from '@testing-library/react'
import App from './App'
import { useLang } from './store/lang'

it('renders the shell and syncs the document title with the language', () => {
  useLang.getState().setLang('en')
  render(<App />)
  expect(screen.getByRole('main')).toBeInTheDocument()
  expect(screen.getByRole('contentinfo')).toHaveTextContent('fan-made tribute')
  expect(document.title).toBe('Aqours — Love Live! Sunshine!! Fan Tribute')
})
