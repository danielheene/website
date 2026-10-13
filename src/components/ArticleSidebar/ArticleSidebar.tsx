import type { JSX, ReactNode } from 'react'

import { cn } from 'tailwind-variants'

export interface ArticleSidebarSection {
  /** Heading shown above the section; omit for an unlabelled block. */
  title?: string
  children: ReactNode
}

export interface ArticleSidebarProps {
  sections?: ArticleSidebarSection[]
  className?: string
}

/**
 * Sticky article sidebar. Hidden below `lg`, where the content column takes
 * the full width and the table of contents would only add noise.
 */
export const ArticleSidebar = ({
  className,
  sections = [],
}: ArticleSidebarProps): JSX.Element | null => {
  return (
    <aside
      className={cn([
        'top-24 hidden h-fit w-64 shrink-0 flex-col gap-8 lg:sticky lg:flex',
        className,
      ])}
    >
      {sections.map(({ title, children }, index) => (
        <section key={title ?? index}>
          {title && (
            <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
              {title}
            </p>
          )}
          <div className="mt-3">{children}</div>
        </section>
      ))}
    </aside>
  )
}
