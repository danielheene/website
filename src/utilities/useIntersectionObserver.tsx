'use client'

import React, { useRef } from 'react'

interface Options extends IntersectionObserverInit {
  triggerOnce?: boolean
}

export const useIntersectionObserver = <E extends HTMLElement = HTMLElement>(
  options?: Options,
): [boolean, React.RefObject<E>] => {
  const { triggerOnce = false } = options || {}
  const elementRef = React.useRef<E | null>(null)
  const previousScrollPosition = useRef<number>(0)
  const [isIntersecting, setIsIntersecting] = React.useState<boolean>(false)
  const [scrollDirection, setScrollDirection] = React.useState<'up' | 'down' | null>(null)

  const handleScroll = React.useCallback(() => {
    const scrollPosition = window.scrollY

    if (scrollPosition > previousScrollPosition.current) {
      setScrollDirection('down')
    } else {
      setScrollDirection('up')
    }
    previousScrollPosition.current = scrollPosition
  }, [])

  React.useEffect(() => {
    window.addEventListener('scroll', handleScroll)
  })

  React.useEffect(() => {
    const observer = new IntersectionObserver((entries): void => {
      const entry = scrollDirection === 'down' ? entries.shift() : entries.pop()

      setIsIntersecting(entry.isIntersecting)
    }, options)

    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    if (isIntersecting && triggerOnce && elementRef.current && observer) {
      observer.unobserve(elementRef.current)
    }

    return () => {
      if (elementRef.current && observer) {
        observer.unobserve(elementRef.current)
      }
    }
  }, [])

  return [isIntersecting, elementRef]
}
