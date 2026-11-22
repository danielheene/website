/** Toolbar toggles (`manager.tsx`) and the decorators that read them (`preview.tsx`). */
export const DARK_MODE_GLOBAL = 'darkMode'

export const DUO_TONE_GLOBAL = 'duoTone'

/** The site's themes are classes on <html>, as next-themes sets them. */
export const applyDarkMode = (isDark: boolean) => {
  document.documentElement.classList.toggle('dark', isDark)
  document.documentElement.classList.toggle('light', !isDark)
}
