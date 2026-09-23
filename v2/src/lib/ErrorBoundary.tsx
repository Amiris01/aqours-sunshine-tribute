import { Component, type ReactNode } from 'react'

interface Props {
  fallback: ReactNode
  onError?: (error: unknown) => void
  children: ReactNode
}

/**
 * Contains failures of lazily loaded chunks (e.g. a stale chunk 404 after a redeploy,
 * or going offline) so one decorative/optional part can't blank the whole page.
 */
export class ErrorBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    this.props.onError?.(error)
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}
