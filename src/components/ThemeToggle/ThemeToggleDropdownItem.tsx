'use client'

import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Moon, Sun } from 'lucide-react'

interface ThemeToggleDropdownItemProps {
  theme?: string
  setTheme: (theme?: string) => void
}

export function ThemeToggleDropdownItem({ theme, setTheme }: ThemeToggleDropdownItemProps) {
  return (
    <div className="flex items-center justify-between gap-4 px-2 py-1.5">
      <div className="flex items-center gap-2">
        {theme === 'dark' ? <Moon className="size-4 text-muted-foreground" /> : <Sun className="size-4 text-muted-foreground" />}
        <Label htmlFor="theme-toggle" className="text-sm font-normal cursor-pointer">
          Dark mode
        </Label>
      </div>
      <Switch
        id="theme-toggle"
        checked={theme === 'dark'}
        onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
        aria-label="Toggle dark mode"
      />
    </div>
  )
}
