import React from 'react'

import type { SettingsNavigation } from '@payload-types'
import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { CMSLink } from '@/components/Link'
import { cn } from '@/utilities/cn'

export async function Footer() {
  const { footerNavItems }: SettingsNavigation = await getCachedGlobal('settingsNavigation', 1)()

  return (
    <footer className={cn(['transition-colors', 'bg-white text-primary'])}>
      <div className="container">
        <hr className="border border-current" />
        <div className="flex flex-row gap-8 justify-between h-20">
          <Link className="my-5" href="/">
            <Logo variant="square-cut" />
          </Link>

          {footerNavItems.length > 0 && (
            <nav className="flex flex-row gap-3 items-center">
              {footerNavItems.map(({ link }, i) => {
                return <CMSLink key={i} {...link} appearance="navLink" />
              })}
            </nav>
          )}
        </div>
      </div>
    </footer>
  )
}
