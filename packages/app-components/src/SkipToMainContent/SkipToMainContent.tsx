'use client'

import { JSX, useCallback } from 'react'
import Link from 'next/link'

import { cn } from 'tailwind-variants'

interface SkipToMainContentProps {
  targetId: string
}

export const SkipToMainContent = ({ targetId }: SkipToMainContentProps): JSX.Element => {
  const handleClick = useCallback(
    (event) => {
      event.preventDefault()
      document.getElementById(targetId)?.scrollIntoView({
        behavior: 'smooth',
      })
    },
    [targetId],
  )

  return (
    <Link
      href={`#${targetId}`}
      className={cn(
        'absolute top-0 left-0 z-999 px-12 py-6',
        'bg-background text-primary',
        'font-pp-supply-sans text-3xl font-medium',
        '-translate-y-full transform focus:translate-y-0',
      )}
      onClick={handleClick}
    >
      Skip to main content
    </Link>
  )
}
