'use client'

import { ThemeToggleIconButton } from '@/components/ThemeToggle'
import { useTheme } from 'next-themes'

export const FooterThemeSwitcher = () => {
  const { theme, setTheme } = useTheme()
  return <ThemeToggleIconButton theme={theme} setTheme={setTheme} />
}
