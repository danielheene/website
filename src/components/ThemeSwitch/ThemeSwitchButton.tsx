import React, { JSX } from 'react'

import { cn } from 'tailwind-variants'

interface ThemeSwitchButtonProps {
  children: React.ReactNode
  isActive: boolean
  onClick: () => void
  label: string
}

export const ThemeSwitchButton = ({
  children,
  isActive,
  onClick,
  label,
}: ThemeSwitchButtonProps): JSX.Element => (
  <button
    className={cn([
      'size-(--button-size) text-[calc(var(--button-size)*0.6)]',
      'relative z-1 m-0 rounded-full p-[calc(var(--button-size)*0.2)]',
      'hover:color-mix',
      isActive && 'bg-accent',
    ])}
    type="button"
    onClick={onClick}
    data-theme-toggle
    aria-label={label}
    aria-current={isActive ? 'true' : 'false'}
    aria-pressed={isActive ? 'true' : 'false'}
  >
    {children}
  </button>
)
