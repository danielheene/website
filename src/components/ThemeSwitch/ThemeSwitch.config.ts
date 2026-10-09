export const config = [
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

export type ThemeConfig = (typeof config)[number]
export type ThemeKey = ThemeConfig['key']
