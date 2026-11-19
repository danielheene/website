'use client'

import type { MouseEvent } from 'react'

import { cn } from 'tailwind-variants'

import type { ExtractedHeading } from '@/lib/extractHeadings'
import { useScrollSpy } from '@/lib/hooks/useScrollSpy'

export interface TableOfContentsProps {
  headings: ExtractedHeading[]
}

export const TableOfContents = ({ headings }: TableOfContentsProps) => {
  const { activeId, scrollTo } = useScrollSpy(headings.map(({ id }) => id))

  if (headings.length === 0) return null

  const handleClick = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault()
    scrollTo(id)
  }

  // Indent relative to the shallowest entry, so a list starting at h2 is not
  // indented as a whole.
  const minLevel = Math.min(...headings.map(({ level }) => level))

  return (
    <ul className="flex flex-col gap-1 border-l border-border">
      {headings.map(({ id, title, level }) => (
        <li key={id}>
          <a
            href={`#${id}`}
            onClick={(event) => handleClick(event, id)}
            aria-current={activeId === id ? 'location' : undefined}
            className={cn([
              '-ml-px block border-l py-1 text-sm leading-snug transition-colors',
              level > minLevel ? 'pl-6' : 'pl-3',
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
