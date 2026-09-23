import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { ErrorBoundary } from './ErrorBoundary'

function Boom(): never {
  throw new Error('chunk failed to load')
}

it('renders the fallback and reports instead of blanking the page', () => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
  const onError = vi.fn()
  render(
    <div>
      <p>page content</p>
      <ErrorBoundary fallback={<p>fallback</p>} onError={onError}>
        <Boom />
      </ErrorBoundary>
    </div>,
  )
  expect(screen.getByText('page content')).toBeInTheDocument()
  expect(screen.getByText('fallback')).toBeInTheDocument()
  expect(onError).toHaveBeenCalledTimes(1)
  vi.restoreAllMocks()
})

it('renders children when nothing throws', () => {
  render(<ErrorBoundary fallback={null}><p>ok</p></ErrorBoundary>)
  expect(screen.getByText('ok')).toBeInTheDocument()
})
