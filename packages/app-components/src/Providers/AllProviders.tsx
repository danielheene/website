'use client'

import { ThemeProvider } from 'next-themes'

export const AllProviders = ({ children }: { children: React.ReactNode }) => {
  /**
   * React 19 / Next 16 fix: suppress the <script> tag warning by
   * telling next-themes to use "application/json" instead of
   * "text/javascript", which React won't try to execute
   */
  const scriptProps =
    typeof window === 'undefined'
      ? undefined
      : ({
          type: 'application/json',
        } as const)

  return (
    <ThemeProvider
      disableTransitionOnChange
      enableColorScheme
      enableSystem
      defaultTheme={'system'}
      scriptProps={scriptProps}
    >
      {children}
    </ThemeProvider>
  )
}
