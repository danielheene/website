import { ReactNode } from 'react'

import { type ClassValue, cn } from 'tailwind-variants'

import './DuoTone.style.css'

interface DuoToneProps {
  className?: ClassValue
  vignette?: boolean
  /**
   * Renders the wrapper as a real, clipping box rather than `display: contents`.
   *
   * Needed whenever the children position themselves against *this* element —
   * the hero carousel, for instance. Left off, the blend layers resolve against
   * the caller's nearest positioned ancestor, which is what the existing
   * full-bleed callers expect.
   */
  contained?: boolean
  children: ReactNode
}

export const DuoTone = ({ children, vignette, contained, className }: DuoToneProps) => {
  return (
    <div className={cn('duo-tone', contained && 'duo-tone--contained', className)}>
      {vignette && <div className="duo-tone__vignette" />}
      {children}
    </div>
  )
}
