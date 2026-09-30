'use client'

import type { HTMLAttributes, JSX } from 'react'

import { type UseRevealOptions, useReveal } from '@/lib/hooks/useReveal'

export type RevealProps = HTMLAttributes<HTMLDivElement> & UseRevealOptions

/**
 * Container form of `useReveal` for server components: children render on the
 * server and pass through. Mark each child that should animate with
 * `data-reveal-item`; tune the motion per container with the
 * `--reveal-transform`, `--reveal-stagger` and `--reveal-duration` custom
 * properties.
 */
export const Reveal = ({ rootMargin, children, ...props }: RevealProps): JSX.Element => {
  const ref = useReveal<HTMLDivElement>({
    rootMargin,
  })

  return (
    <div ref={ref} {...props}>
      {children}
    </div>
  )
}
