'use client'

import { JSX, useCallback } from 'react'
import Link from 'next/link'

import { cn } from '@repo/utils/cn'

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
    [
      targetId,
    ],
  )
  return (
    <Link
      href={`#${targetId}`}
      className={cn(
        'absolute left-0 top-0  py-6 px-12 z-999',
        'bg-background text-primary',
        'text-3xl font-medium font-pp-supply-sans',
        'transform -translate-y-full focus:translate-y-0',
      )}
      onClick={handleClick}
    >
      Skip to main content
    </Link>
  )
}
