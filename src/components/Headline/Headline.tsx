import type React from 'react'
import { memo, type ReactNode, useMemo } from 'react'

import { cn } from 'tailwind-variants'

interface HeadlineProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode
  as?: 'h2' | 'h3' | 'h4'
  variant?: 'default' | 'page-title' | 'section' | 'subline'
  className?: string
}

export const Headline = memo(function Headline({
  children,
  as,
  variant = 'default',
  className = '',
  ...otherProps
}: HeadlineProps) {
  const Comp = useMemo(() => {
    if (variant === 'page-title') return as ?? 'h1'
    if (variant === 'section') return as ?? 'h2'
    if (variant === 'subline') return as ?? 'h3'
    return 'h3'
  }, [
    as,
    variant,
  ])

  return (
    <Comp
      className={cn([
        'font-mono text-inherit',
        variant === 'page-title' && 'text-6xl leading-tight',
        variant === 'section' && 'text-5xl',
        variant === 'subline' && 'text-3xl',
        variant === 'default' && 'text-xl',
        className,
      ])}
      {...otherProps}
    >
      {children}
    </Comp>
  )
})
