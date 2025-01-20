import React from 'react'

import { cn } from '@/utilities/cn'
import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { Icon, IconName } from '@/components/Icon'

export async function Header() {
  const platformLinks: Array<{ icon: IconName; link: string }> = [
    {
      icon: 'mail',
      link: 'mailto:daniel@heene.io',
    },
    {
      icon: 'github',
      link: 'https://github.com/danielheene',
    },
    {
      icon: 'linkedin',
      link: 'https://www.linkedin.com/in/danielheene',
    },
  ]

  return (
    <header className="pointer-events-none relative z-50 h-32 bg-gradient-to-b from-white">
      <div
        className={cn([
          'container h-12 md:h-16 lg:h-20',
          'flex items-center justify-between gap-6',
          'pointer-events-auto',
        ])}
      >
        <Link href="/" className="flex items-center py-1">
          <Logo variant="singleline" color="primary" className="h-6 md:h-7 lg:h-8" />
        </Link>

        <nav className="flex gap-0 md:gap-4 lg:gap-8 items-center text-2xl md:text-3xl lg:text-4xl text-primary">
          {platformLinks.map(({ icon, link }, i) => (
            <Link key={i} href={link} className="p-1" target="_blank" rel="noopener noreferrer">
              <Icon name={icon} />
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
