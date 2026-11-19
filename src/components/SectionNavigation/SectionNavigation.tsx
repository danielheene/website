'use client'

import { type MouseEvent, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'

import { cn } from 'tailwind-variants'

import type { ExtractedHeading } from '@/lib/extractHeadings'
import { useScrollSpy } from '@/lib/hooks/useScrollSpy'

export interface SectionNavigationProps {
  /** Page sections, usually the `section` entries of `extractHeadings(blocks)`. */
  sections: Pick<ExtractedHeading, 'id' | 'title'>[]
}

const noopSubscribe = () => () => {}

// `document.body` only exists after hydration; the portal waits for it.
const useIsClient = () =>
  useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  )

/**
 * Fixed vertical navigation along the side of the viewport, highlighting the
 * section the reader is in.
 */
export const SectionNavigation = ({ sections }: SectionNavigationProps) => {
  const isClient = useIsClient()
  const { activeId, scrollTo } = useScrollSpy(sections.map(({ id }) => id))

  if (!isClient || sections.length === 0) return null

  const handleClick = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault()
    scrollTo(id)
  }

  return createPortal(
    <nav
      aria-label="Sections"
      className="fixed top-0 z-50 hidden h-screen animate-fade-in flex-col justify-center overflow-hidden bg-background/60 backdrop-blur-md md:flex"
    >
      {sections.map(({ id, title }) => (
        <a
          key={id}
          href={`#${id}`}
          onClick={(event) => handleClick(event, id)}
          aria-current={activeId === id ? 'location' : undefined}
          className={cn([
            'vertical-writing-rl orientation-sideways rotate-180',
            'my-1 transform-gpu px-4 transition-opacity duration-500 ease-in-out',
            'font-mono text-sm font-light text-foreground/80 dark:text-foreground/50',
            activeId === id && 'animate-flip font-medium text-primary/100 dark:text-foreground',
          ])}
        >
          {title}
        </a>
      ))}
    </nav>,
    document.body,
  )
}
