'use client'

import { JSX } from 'react'
import { useTheme } from 'next-themes'

import { ThemeSwitch } from '@/components/ThemeSwitch'

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
      setTheme={setTheme}
    />
  )
}
