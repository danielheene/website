'use client'

/**
 * Root error boundary.
 *
 * It replaces the entire document, so it carries its own html/body.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & {
    digest?: string
  }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-8 text-foreground">
        <div className="flex max-w-md flex-col items-center gap-4 text-center">
          <h1 className="font-mono text-2xl font-semibold">Something went wrong</h1>
          <p className="text-muted-foreground">Try again, or head back to the homepage.</p>
          {error.digest && (
            <p className="font-mono text-xs text-muted-foreground/70">Reference: {error.digest}</p>
          )}
          <div className="mt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={reset}
              className="rounded-md border border-border px-4 py-2 font-mono text-sm transition-colors hover:bg-muted"
            >
              Try again
            </button>
            <a
              href="/"
              className="rounded-md border border-border px-4 py-2 font-mono text-sm transition-colors hover:bg-muted"
            >
              Homepage
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}
