// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ErrorBoundary } from './ErrorBoundary'

const Boom = ({ message = 'boom' }: { message?: string }) => {
  throw new Error(message)
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // React logs caught render errors to console.error; silence the noise.
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders children when nothing throws', () => {
    render(
      <ErrorBoundary>
        <p>all good</p>
      </ErrorBoundary>,
    )

    expect(screen.getByText('all good')).toBeInTheDocument()
  })

  it('renders nothing by default when a child throws', () => {
    const { container } = render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('isolates the failure so sibling content still renders', () => {
    render(
      <div>
        <ErrorBoundary>
          <Boom />
        </ErrorBoundary>
        <p>sibling survived</p>
      </div>,
    )

    expect(screen.getByText('sibling survived')).toBeInTheDocument()
  })

  it('renders a static fallback when provided', () => {
    render(
      <ErrorBoundary fallback={<p>could not load</p>}>
        <Boom />
      </ErrorBoundary>,
    )

    expect(screen.getByText('could not load')).toBeInTheDocument()
  })

  it('passes the error to a render-function fallback', () => {
    render(
      <ErrorBoundary fallback={(error) => <p>failed: {error.message}</p>}>
        <Boom message="kaboom" />
      </ErrorBoundary>,
    )

    expect(screen.getByText('failed: kaboom')).toBeInTheDocument()
  })

  it('invokes the onError callback with the error', () => {
    const onError = vi.fn()

    render(
      <ErrorBoundary onError={onError}>
        <Boom message="notified" />
      </ErrorBoundary>,
    )

    expect(onError).toHaveBeenCalledTimes(1)
    expect((onError.mock.calls[0][0] as Error).message).toBe('notified')
  })
})
