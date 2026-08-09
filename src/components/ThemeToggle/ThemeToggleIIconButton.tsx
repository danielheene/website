'use client'

import { Button } from '../Button'
import { Icon } from '../Icon'

interface ThemeToggleIconButtonProps {
  theme?: string
  setTheme: (theme?: string) => void
}
export function ThemeToggleIconButton({ theme, setTheme }: ThemeToggleIconButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle dark mode"
    >
      <Icon
        name="lucide:sun"
        className=" rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0"
      />
      <Icon
        name="lucide:moon"
        className="absolute  rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100"
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
