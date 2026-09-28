'use client'

import { JSX, useEffect, useMemo, useState } from 'react'
import { useTheme } from 'next-themes'

import { cn } from 'tailwind-variants'

import { Icon } from '@/components/Icon'

const themeConfigs = [
  {
    key: 'light',
    label: 'toggle light theme',
    icon: 'lucide:sun',
  },
  {
    key: 'system',
    label: 'toggle system theme',
    icon: 'lucide:monitor',
  },
  {
    key: 'dark',
    label: 'toggle dark theme',
    icon: 'lucide:moon',
  },
] as const

type ThemeKey = (typeof themeConfigs)[number]['key']

interface FooterThemeSwitcherProps {
  className?: string
  options: ThemeKey[]
}

export const FooterThemeSwitcher = ({
  className,
  options = [],
}: FooterThemeSwitcherProps): JSX.Element => {
  const [mounted, setMounted] = useState(false)
  const { theme: currentTheme, setTheme } = useTheme()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setMounted(true)
    }
  }, [])

  const selectedThemes = useMemo(
    () => themeConfigs.filter(({ key }) => options.includes(key)),
    [
      options,
    ],
  )

  if (!mounted) return null
  return (
    <div
      className={cn([
        '[--button-size:--spacing(8)]',
        'flex flex-row gap-0.5',
        'relative box-content bg-background border-2 border-background rounded-full w-fit',
        'outline-2 outline-accent',
        className,
      ])}
    >
      {selectedThemes.map(({ key, label, icon }) => (
        <ThemeSwitcherButton
          key={key}
          isActive={currentTheme === key}
          onClick={() => setTheme(key)}
          label={label}
        >
          <Icon name={icon} />
        </ThemeSwitcherButton>
      ))}
    </div>
  )
}

const ThemeSwitcherButton = ({ children, isActive, onClick, label }) => (
  <button
    className={cn([
      'w-(--button-size) h-(--button-size) text-[calc(var(--button-size)*0.6)]',
      'p-[calc(var(--button-size)*0.2)] m-0 relative z-1 rounded-full',
      'hover:color-mix',
      isActive && 'bg-accent',
    ])}
    type="button"
    onClick={onClick}
    aria-label={label}
    aria-current={isActive ? 'true' : 'false'}
  >
    {children}
  </button>
)
