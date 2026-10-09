'use client'

import { JSX, useEffect, useMemo, useState } from 'react'

import { cn } from 'tailwind-variants'

import { Icon } from '@/components/Icon'
import { ThemeSwitchButton } from '@/components/ThemeSwitch/ThemeSwitchButton'

import { config, ThemeKey, ThemeConfig } from './ThemeSwitch.config'

interface ThemeSwitchProps {
  className?: string
  options?: ThemeKey[]
  theme: string
  setTheme: (theme: string) => void
}

export const ThemeSwitch = ({
  className,
  options = ['light', 'system', 'dark'],
  theme,
  setTheme,
}: ThemeSwitchProps): JSX.Element => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setMounted(true)
    }
  }, [])

  const selectedThemes: ThemeConfig[] = useMemo(
    () =>
      config
        .filter(({ key }) => options.includes(key))
        .sort(
          (a, b) =>
            config.findIndex(({ key }) => key === a.key) -
            config.findIndex(({ key }) => key === b.key),
        ),
    [options],
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
        <ThemeSwitchButton
          key={key}
          isActive={theme === key}
          onClick={() => setTheme(key)}
          label={label}
        >
          <Icon name={icon} />
        </ThemeSwitchButton>
      ))}
    </div>
  )
}
