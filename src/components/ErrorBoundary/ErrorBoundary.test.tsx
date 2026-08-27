// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const captureException = vi.fn()

vi.mock('@sentry/nextjs', () => ({
  captureException: (...args: unknown[]) => captureException(...args),
}))

const { ErrorBoundary } = await import('./ErrorBoundary')

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
    captureException.mockReset()
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

  it('reports the error to Sentry tagged with the boundary name', () => {
    render(
      <ErrorBoundary name="TrendingBlogPostsBlock">
        <Boom message="block failed" />
      </ErrorBoundary>,
    )

    expect(captureException).toHaveBeenCalledTimes(1)
    const [error, context] = captureException.mock.calls[0] as [
      Error,
      Record<string, never>,
    ]
    expect(error.message).toBe('block failed')
    expect(context).toMatchObject({
      tags: {
        errorBoundary: 'TrendingBlogPostsBlock',
      },
    })
  })

  it('tags the report as unnamed when no name is given', () => {
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    )

    const [, context] = captureException.mock.calls[0] as [
      Error,
      Record<string, never>,
    ]
    expect(context).toMatchObject({
      tags: {
        errorBoundary: 'unnamed',
      },
    })
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
