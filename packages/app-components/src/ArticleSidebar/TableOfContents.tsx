'use client'

import { useEffect, useState } from 'react'

import type { ExtractedHeading } from '@website/lib/extractHeadings'
import { cn } from 'tailwind-variants'

export interface TableOfContentsProps {
  headings: ExtractedHeading[]
}

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
  }, [headings])

  if (headings.length === 0) return null

  return (
    <ul className="flex flex-col gap-1 border-l border-border">
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
  )
}
