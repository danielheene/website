'use client'

import type { HeaderNavigationData } from '@payload-types'
import Link from 'next/link'
import React from 'react'

import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo'
import { cn } from '@/utilities/cn'

interface HeaderClientProps {
  mainNavigation?: HeaderNavigationData['mainNavigation']
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
    <header ref={headerRef} className={`page-header container sticky top-0 z-50 -mb-(--header-height)`}>
      {/*<div className="pointer-events-none relative">*/}
      <div
        className={cn([
          'h-12 md:h-16 lg:h-20  border-none ',
          'flex items-center justify-between gap-6',
          'pointer-events-auto relative z-10',
          'text-foreground font-mono',
          'text-lg sm:text-xl md:text-2xl lg:text-3xl',
        ])}
      >
        <Link href="/">
          <Logo variant="inline" blink className="hidden md:inline-block" />
          <Logo variant="square" className="text-4xl md:hidden" />
        </Link>

        <ul className="flex flex-row md:gap-4 lg:gap-8 items-center">
          {mainNavigation?.map(({ id, link }) => (
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
