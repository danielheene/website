'use client'

import { useIntersectionObserver } from '@/utilities/useIntersectionObserver'
import { HTMLProps, ReactNode, useEffect } from 'react'
import { cn } from '@/utilities/cn'
import { useSectionNavigation } from './SectionNavigationProvider'

export interface SectionContainerProps extends HTMLProps<HTMLDivElement> {
  className?: string
  children?: ReactNode
  id?: string
  title?: string
  globalType?: string
}

export const SectionContainer = ({ className, children, id, title }: SectionContainerProps) => {
  const [isObserving, observerRef] = useIntersectionObserver({ threshold: 0.1 })
  const { setActiveAnchor, registerAnchor } = useSectionNavigation()

  useEffect(() => {
    if (id && title) registerAnchor({ id, title })
  }, [])

  useEffect(() => {
    if (isObserving) setActiveAnchor(id)
  }, [isObserving])

  return (
    <section ref={observerRef} id={id} className={cn('shrink-0 grow-0', className)}>
      {children}
    </section>
  )
}
