'use client'

import { type MouseEvent, useCallback } from 'react'
import ReactDOM from 'react-dom'

import { cn } from '@/lib/cn'

import { useCreatePortalHost } from '../hooks/useCreatePortalHost'
import type {
  SectionNavigationAnchor,
  SetScrollingToAnchorFunction,
} from './SectionNavigation.types'

export interface SectionNavigationDisplayProps {
  anchors: SectionNavigationAnchor[]
  setScrollingToAnchor: SetScrollingToAnchorFunction
}

export const SectionNavigationDisplay = ({
  anchors,
  setScrollingToAnchor,
}: SectionNavigationDisplayProps) => {
  const portalHost = useCreatePortalHost('anchor-navigation')

  const handleAnchorClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault()

      if ('getAttribute' in event.target && typeof event.target.getAttribute === 'function') {
        const id = event.target.getAttribute('href')?.replace(/^#/, '')
        const scrollTarget = document.getElementById(id)

        if (scrollTarget) {
          setScrollingToAnchor(id)

          scrollTarget.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'center',
          })
        }
      }
    },
    [
      setScrollingToAnchor,
    ],
  )

  return (
    anchors.length > 0 &&
    portalHost.current &&
    ReactDOM.createPortal(
      <nav
        className={cn([
          'fixed top-0 h-screen hidden md:flex flex-col justify-center animate-fade-in bg-background/60 backdrop-blur-md overflow-hidden z-50',
        ])}
      >
        {anchors.map(({ id, title, active }) => (
          <a
            key={id}
            href={`#${id}`}
            onClick={handleAnchorClick}
            className={cn([
              'vertical-writing-rl orientation-sideways rotate-180',
              'my-1 px-4 transition-opacity duration-500 ease-in-out transform-gpu',
              'text-foreground/80 dark:text-foreground/50 text-sm font-mono font-light',
              active && 'text-primary/100 dark:text-foreground font-medium animate-flip',
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
