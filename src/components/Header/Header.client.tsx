'use client'

import { Icon } from '@/components/Icon'
import { Logo } from '@/components/Logo'

import { cn } from '@/utilities/cn'
import { generateContentURL } from '@/utilities/generateContentURL'
import { HeaderNavigationData } from '@payload-types'
import { convertLexicalToPlaintext } from '@payloadcms/richtext-lexical/plaintext'
import Link from 'next/link'
import React from 'react'

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
          'text-white font-pp-supply-mono drop-shadow-xl',
          'text-lg sm:text-xl md:text-2xl lg:text-3xl',
        ])}
      >
        <Link href="/">
          <Logo variant="inline" blink className="hidden md:inline-block" />
          <Logo variant="square" className="text-4xl md:hidden" />
        </Link>

        <nav className="flex gap-0 md:gap-4 lg:gap-8 items-center">
          {mainNavigation?.map(({ id, link }) => {
            const { type, newTab, label, reference, address, url, subject, cc, icon, body } = link

            let href = url
            if (type === 'reference') {
              const collection = reference.relationTo
              const slug = typeof reference.value === 'string' ? reference.value : reference.value.slug
              href = generateContentURL({ collection, slug }).toString()
            }
            if (type === 'mailto') {
              const params = new URLSearchParams({
                subject,
                cc,
                body: convertLexicalToPlaintext({ data: body }),
              })
              href = `mailto:${address}?${params.toString()}`
            }

            return (
              <Link key={id} href={href} target={newTab ? '_blank' : '_self'}>
                {icon && <Icon name={icon} icon={icon} />}
                {label && label}
              </Link>
            )
          })}
        </nav>
      </div>
      {/*</div>*/}
    </header>
  )
}
