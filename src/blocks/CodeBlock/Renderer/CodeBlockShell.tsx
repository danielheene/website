import type { JSX } from 'react'

import { cn } from '@/lib/cn'

import { CopyButton } from './CopyButton'

type CodeBlockShellProps = {
  className?: string
  code: string
  /**
   * Shiki-rendered markup. When omitted the block falls back to plain,
   * unhighlighted code — used on the client path, where the highlighter cannot
   * run.
   */
  html?: string
}

/**
 * Presentational chrome shared by both code block entry points.
 *
 * Contains no server-only imports, so it is safe to render from a Client
 * Component as well as from the async Server Component.
 */
export const CodeBlockShell = ({ className, code, html }: CodeBlockShellProps): JSX.Element => (
  <div
    className={cn([
      'not-prose group/code relative rounded-md border border-border',
      className,
    ])}
  >
    <div className="absolute top-2 right-2 z-10 opacity-0 transition-opacity group-hover/code:opacity-100 focus-within:opacity-100">
      <CopyButton code={code} />
    </div>

    {html ? (
      <div
        className="shiki-container overflow-x-auto"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Shiki output is generated server-side from stored code, not user-supplied HTML
        dangerouslySetInnerHTML={{
          __html: html,
        }}
      />
    ) : (
      <div className="shiki-container overflow-x-auto text-sm">
        <pre>
          <code>{code}</code>
        </pre>
      </div>
    )}
  </div>
)
