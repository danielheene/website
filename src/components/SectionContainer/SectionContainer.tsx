import type { ReactNode } from 'react'

import { cn } from 'tailwind-variants'

import { createAnchorId } from '@/lib/extractHeadings'

export interface SectionContainerProps {
  /**
   * Anchor id, normally the block's `anchorId` from `RenderBlocks` so it is
   * unique on the page and matches the section navigation. Falls back to the
   * slugified `title` (`/resume#about-me`).
   */
  id?: string
  title: string
  variant?: 'default' | 'primary'
  children: ReactNode
}

export const SectionContainer = ({
  id,
  title,
  variant = 'default',
  children,
}: SectionContainerProps) => (
  <section
    id={id || createAnchorId(title)}
    className={cn([
      'relative m-0 min-h-[50vh] shrink-0 grow-0 p-0',
      variant === 'default' && 'bg-background text-foreground',
      variant === 'primary' && 'bg-primary text-primary-foreground',
    ])}
  >
    {children}
  </section>
)
