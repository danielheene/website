'use client'

import slugify from '@sindresorhus/slugify'
import { type ReactNode, useEffect } from 'react'
import { useIntersectionObserver } from 'usehooks-ts'

import { cn } from '@/utilities/cn'

import { useSectionNavigation } from '../PageContainer/SectionNavigation'

export interface SectionContainerProps {
  id: string
  title: string
  variant?: 'default' | 'primary'
  children: ReactNode
}

export const SectionContainer = ({ id: rawId, title, variant = 'default', children }: SectionContainerProps) => {
  const [observerRef, isObserving, entry] = useIntersectionObserver({ threshold: [0.1, 0.25], rootMargin: '-10%' })
  const { setActiveAnchor, registerAnchor } = useSectionNavigation()

  const id = slugify(rawId)

  useEffect(() => {
    if (id && title) registerAnchor({ id, title })
  }, [id, registerAnchor, title])

  useEffect(() => {
    if (id && isObserving) setActiveAnchor(id)
  }, [isObserving, id, setActiveAnchor])

  return (
    <section
      id={id}
      className={cn([
        'relative m-0 p-0 shrink-0 grow-0',
        'py-20 md:py-32 lg:py-40',
        variant === 'default' && 'bg-background text-foreground',
        variant === 'primary' && 'bg-primary text-primary-foreground',
      ])}
    >
      <div ref={observerRef} className="min-h-[50vh]">
        {children}
      </div>
    </section>
  )
}
