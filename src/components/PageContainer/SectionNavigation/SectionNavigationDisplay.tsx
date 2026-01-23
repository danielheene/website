'use client'

import { cn } from '@/utilities/cn'
import { MouseEvent, useCallback } from 'react'
import { useCreatePortalHost } from '@/utilities/useCreatePortalHost'
import ReactDOM from 'react-dom'
import { SectionNavigationAnchor, SetScrollingToAnchorFunction } from './SectionNavigation.types'

export interface SectionNavigationDisplayProps {
  anchors: SectionNavigationAnchor[]
  setScrollingToAnchor: SetScrollingToAnchorFunction
}

export const SectionNavigationDisplay = ({ anchors, setScrollingToAnchor }: SectionNavigationDisplayProps) => {
  const portalHost = useCreatePortalHost('anchor-navigation')

  const handleAnchorClick = useCallback((event: MouseEvent<HTMLAnchorElement>) => {
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
  }, [])

  return (
    anchors.length > 0 &&
    portalHost.current &&
    ReactDOM.createPortal(
      <nav className={cn(['fixed top-0 h-screen hidden md:flex flex-col justify-center animate-fade-in bg-white/30 backdrop-blur-sm'])}>
        {anchors.map(({ id, title, active }) => (
          <a
            key={id}
            href={'#'+id}
            onClick={handleAnchorClick}
            className={cn([
              'vertical-writing-rl orientation-sideways-right rotate-180',
              'my-2 px-4 transition-opacity duration-500 ease-in-out transform-gpu',
              'text-gray-900 font-mono opacity-80 font-medium',
              active && 'opacity-100 font-extrabold animate-flip',
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
