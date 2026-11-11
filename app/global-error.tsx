'use client'

import '#frontend.css'
import PPSupplyMono from '@/fonts/pp-supply-mono/next'
import PPSupplySans from '@/fonts/pp-supply-sans/next'

/**
 * Root error boundary.
 *
 * It replaces the entire document, root layout included, so it carries its own
 * html/body and loads the stylesheet and fonts itself. Next only resolves this
 * file at the root of `app/`, never inside a route group.
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
    <html
      lang="en"
      className={`${PPSupplySans.variable} ${PPSupplyMono.variable}`}
      data-theme="system"
    >
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
