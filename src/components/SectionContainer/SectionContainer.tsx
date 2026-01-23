'use client'

import { cn } from '@/utilities/cn'
import slugify from '@sindresorhus/slugify'
import { ReactNode, useEffect } from 'react'
import { useIntersectionObserver } from 'usehooks-ts'
import { useSectionNavigation } from '../PageContainer/SectionNavigation'

export interface SectionContainerProps {
  id: string
  title: string
  variant?: 'default' | 'primary'
  children: ReactNode
}

export const SectionContainer = ({ id: rawId, title, variant = 'default', children }: SectionContainerProps) => {
  const [observerRef, isObserving] = useIntersectionObserver({ threshold: [0.1, 0.25], rootMargin: '-10%' })
  const { setActiveAnchor, registerAnchor } = useSectionNavigation()

  const id = slugify(rawId)

  useEffect(() => {
    if (id && title) registerAnchor({ id, title })
  }, [])

  useEffect(() => {
    if (id && isObserving) setActiveAnchor(id)
  }, [isObserving])

  return (
    <section
      id={id}
      className={cn([
        'relative w-[200%] -translate-x-1/4 shrink-0 grow-0',
        '-rotate-2',
        variant === 'default' && 'bg-white text-black',
        variant === 'primary' && 'bg-primary text-white',
      ])}
    >
      <div ref={observerRef} className="container mx-auto shrink-0 grow-0 rotate-2">
        {children}
      </div>
    </section>
  )
}
