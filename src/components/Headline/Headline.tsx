import React, { memo, ReactNode, useMemo } from 'react'
import { cn } from '@/utilities/cn'

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
  }, [as, variant])

  return (
    <Comp
      className={cn([
        variant === 'default' && 'font-mono',
        variant === 'page-title' &&
          'container text-6xl leading-tight text-primary font-pp-supply-mono',
        variant === 'section' && 'text-5xl text-inherit font-pp-supply-mono',
        variant === 'subline' && 'text-3xl text-inherit font-mono',
        className,
      ])}
      {...otherProps}
    >
      {children}
    </Comp>
  )
})
