'use client'

import { ThemeProvider } from 'next-themes'

import { UmamiProvider } from '@/contexts/Umami'

export const AllProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider disableTransitionOnChange enableColorScheme enableSystem>
      <UmamiProvider websiteId={process.env.NEXT_PUBLIC_UMAMI_SITE_ID}>{children}</UmamiProvider>
    </ThemeProvider>
  )
}
