'use client'

import { JSX } from 'react'
import { useTheme } from 'next-themes'

import { ThemeSwitch } from '@/components/ThemeSwitch'
import { UmamiEvent } from '@/lib/umami/events'
import { track } from '@/lib/umami/track'

interface FooterThemeSwitchProps {
  className?: string
}

export const FooterThemeSwitch = ({ className }: FooterThemeSwitchProps): JSX.Element => {
  const { theme, setTheme } = useTheme()

  return (
    <ThemeSwitch
      className={className}
      options={['light', 'system', 'dark']}
      theme={theme}
      setTheme={(next) => {
        setTheme(next)
        track(UmamiEvent.ThemeSwitch, { theme: next })
      }}
    />
  )
}
