'use client'

import React from 'react'
import Link from 'next/link'

import { CMSLink } from '@website/app-components/Link/index'
import { Logo } from '@website/components/Logo'
import type { HeaderSettings } from '@website/types/payload'
import { cn } from 'tailwind-variants'

interface HeaderClientProps {
  mainNavigation?: HeaderSettings['mainNavigation']
}

export const HeaderClient = ({ mainNavigation }: HeaderClientProps) => {
  const headerRef = React.useRef<HTMLDivElement>(null)

  // const { setHeaderHeight } = useUI()
  //
  // useResizeObserver({
  //   ref: headerRef,
  //   box: 'border-box',
  //   onResize: ({ height }) => setHeaderHeight(height),
  // })

  return (
    <header
      ref={headerRef}
      className={`page-header sticky top-0 z-50 container -mb-(--header-height)`}
    >
      {/*<div className="pointer-events-none relative">*/}
      <div
        className={cn([
          'h-12 border-none md:h-16 lg:h-20',
          'flex items-center justify-between gap-6',
          'pointer-events-auto relative z-10',
          'font-mono text-foreground',
          'text-lg sm:text-xl md:text-2xl lg:text-3xl',
        ])}
      >
        <Link href="/">
          <Logo variant="inline" blink className="hidden md:inline-block" />
          <Logo variant="square" className="text-4xl md:hidden" />
        </Link>

        <ul className="flex flex-row items-center md:gap-4 lg:gap-8">
          {mainNavigation?.entries?.map(({ id, ...link }) => (
            <li key={id}>
              <CMSLink {...link} className="text-foreground hover:text-current" />
            </li>
          ))}
        </ul>
      </div>
      {/*</div>*/}
    </header>
  )
}
