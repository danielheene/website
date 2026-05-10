import type { ReactNode } from 'react'

import { type ClassValue, cn } from '@/lib/cn'

export interface DuoToneProps {
  className?: ClassValue
  children: (className: ClassValue) => ReactNode
}

export const DuoTone = ({ children, className }: DuoToneProps) => {
  return (
    <div
      className={cn([
        [
          'contents',
          'relative',
          'bg-background',
          'pointer-events-none',
          'user-select-none',
        ],
        [
          'before:absolute',
          'before:z-10',
          'before:left-0',
          'before:top-0',
          'before:right-0',
          'before:bottom-0',
          'before:w-full',
          'before:h-full',
          'before:bg-primary',
          'before:mix-blend-lighten',
          'dark:before:mix-blend-darken',
        ],
        className,
      ])}
    >
      {children([
        'grayscale',
        'contrast-100',
        'blur-0',
        'mix-blend-darken',
        'dark:mix-blend-lighten',
      ])}
    </div>
  )
}
