'use client'

import { useEffect, useState } from 'react'

import { cn } from '@repo/utils/cn'
import type { ExtractedHeading } from '@repo/utils/extractHeadings'

export interface TableOfContentsProps {
  headings: ExtractedHeading[]
}

/**
 * Table of contents with scroll-spy highlighting.
 *
 * The active heading is the last one whose top edge has passed the reading
 * line (a third down the viewport). An IntersectionObserver alone is not
 * enough here: short trailing sections never intersect far enough to win, and
 * headings scrolled past above the viewport stop reporting entirely.
 */
export const TableOfContents = ({ headings }: TableOfContentsProps) => {
  const [activeId, setActiveId] = useState<string>(headings[0]?.id ?? '')

  useEffect(() => {
    if (headings.length === 0) return

    const updateActive = () => {
      const readingLine = window.innerHeight / 3

      const passed = headings.filter((heading) => {
        const element = document.getElementById(heading.id)
        return element ? element.getBoundingClientRect().top <= readingLine : false
      })

      // near the bottom the last heading wins, otherwise nothing would be
      // reachable for short final sections
      const atBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 2

      const next = atBottom
        ? headings[headings.length - 1]
        : (passed[passed.length - 1] ?? headings[0])

      setActiveId((current) => (current === next.id ? current : next.id))
    }

    updateActive()
    window.addEventListener('scroll', updateActive, {
      passive: true,
    })
    window.addEventListener('resize', updateActive)

    return () => {
      window.removeEventListener('scroll', updateActive)
      window.removeEventListener('resize', updateActive)
    }
  }, [
    headings,
  ])

  if (headings.length === 0) return null

  return (
    <nav aria-label="Table of contents">
      <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
        On this page
      </p>
      <ul className="mt-3 flex flex-col gap-1 border-l border-border">
        {headings.map(({ id, title, level }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              aria-current={activeId === id ? 'location' : undefined}
              className={cn([
                '-ml-px block border-l py-1 text-sm leading-snug transition-colors',
                level >= 3 ? 'pl-6' : 'pl-3',
                activeId === id
                  ? 'border-primary font-medium text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              ])}
            >
              {title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
