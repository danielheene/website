'use client'

import { cn } from '@/utilities/cn'
import { MouseEvent, useCallback, useRef } from 'react'
import { useSectionNavigation } from './SectionNavigationProvider'
import { useCreatePortalHost } from '@/utilities/useCreatePortalHost'
import ReactDOM from 'react-dom'

export interface SectionNavigationProps {
  className?: string
}

export const SectionNavigation = ({ className }: SectionNavigationProps) => {
  const timeoutRef = useRef<number | null>(null)
  const { anchors, setActiveAnchor } = useSectionNavigation()
  const portalHost = useCreatePortalHost('anchor-navigation')

  const handleAnchorClick = useCallback((event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()

    if ('getAttribute' in event.target && typeof event.target.getAttribute === 'function') {
      const id = event.target.getAttribute('href').replace(/^#/, '')
      const scrollTarget = document.getElementById(id)

      if (scrollTarget) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = window.setTimeout(() => setActiveAnchor(id), 500)

        scrollTarget.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'center',
        })
      }
    }
  }, [])

  return (
    anchors.length > 0 &&
    portalHost.current &&
    ReactDOM.createPortal(
      <nav
        className={cn([
          'absolute top-0 h-screen hidden md:flex flex-col justify-center animate-fade',
          className,
        ])}
        onClick={handleAnchorClick}
      >
        {anchors.map(({ id, title, active }) => (
          <a
            key={id}
            href={`#${id}`}
            onClick={handleAnchorClick}
            className={cn([
              'vertical-writing-rl orientation-sideways-right rotate-180',
              'my-4 px-2 transition-opacity duration-500 ease-in-out',
              'text-white text-lg font-mono tracking-wide mix-blend-difference',
              active ? 'opacity-100 font-bold' : 'opacity-60 font-light',
            ])}
          >
            {title}
          </a>
        ))}
      </nav>,
      portalHost.current,
    )
  )
}
