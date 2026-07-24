import { ReactNode } from 'react'

import { type ClassValue, cn } from '@/lib/cn'

import styles from './DuoTone.module.css'

interface DuoToneProps {
  className?: ClassValue
  vignette?: boolean
  children: ReactNode
}

export const DuoTone = ({ children, vignette, className }: DuoToneProps) => {
  return (
    <div className={cn(styles.Container, className)}>
      {vignette && <div className={styles.Vignette} />}
      {children}
    </div>
  )
}
