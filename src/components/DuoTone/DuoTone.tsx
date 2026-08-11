import { ReactNode } from 'react'

import { type ClassValue, cn } from '@/lib/cn'

import styles from './DuoTone.module.css'

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
    <div className={cn(styles.Container, contained && styles.Contained, className)}>
      {vignette && <div className={styles.Vignette} />}
      {children}
    </div>
  )
}
