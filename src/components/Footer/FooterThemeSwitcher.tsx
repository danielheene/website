'use client'

import { useTheme } from 'next-themes'

import { ThemeToggleIconButton } from '@/components/ThemeToggle'

export const FooterThemeSwitcher = () => {
  const { theme, setTheme } = useTheme()
  return <ThemeToggleIconButton theme={theme} setTheme={setTheme} />
}
