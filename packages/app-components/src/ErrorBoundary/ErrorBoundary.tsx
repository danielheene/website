'use client'

import { Component, type ErrorInfo, type ReactNode } from 'react'

import * as Sentry from '@sentry/nextjs'

export interface ErrorBoundaryProps {
  children: ReactNode
  /**
   * Rendered in place of `children` when a render error is caught. Defaults to
   * `null` — a failing, non-essential subtree (a CMS block, a widget) should
   * disappear rather than replace the page with an error message.
   *
   * Pass a render function to show something contextual, e.g. a retry button.
   */
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode)
  /**
   * Label attached to the Sentry report, so a crash can be traced back to the
   * boundary that caught it (e.g. the block type that failed).
   */
  name?: string
  /** Additional side effect on catch, e.g. local logging or a metric. */
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface ErrorBoundaryState {
  error: Error | null
}

/**
 * Generic client-side error boundary for wrapping non-essential subtrees.
 *
 * React only supports error boundaries as class components, so this stays a
 * class even though the rest of the codebase is function components.
 *
 * Next.js `error.tsx`/`global-error.tsx` files already cover route-level and
 * root-level crashes, but they replace the *entire* route. This boundary is
 * for the finer-grained case: one CMS block, widget, or third-party embed
 * failing should degrade to nothing while the rest of the page renders
 * normally. Errors are still forwarded to Sentry, so silence here never means
 * an unreported crash.
 *
 * Note this catches errors thrown while *rendering* on the client. It does not
 * catch errors in event handlers, `setTimeout`, or async code — those need
 * their own try/catch.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    error: null,
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { name, onError } = this.props

    Sentry.captureException(error, {
      tags: {
        errorBoundary: name ?? 'unnamed',
      },
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    })

    onError?.(error, errorInfo)
  }

  reset = (): void => {
    this.setState({
      error: null,
    })
  }

  render(): ReactNode {
    const { error } = this.state
    const { children, fallback } = this.props

    if (error) {
      return typeof fallback === 'function' ? fallback(error, this.reset) : (fallback ?? null)
    }

    return children
  }
}
