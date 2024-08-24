'use client'

import { FC, useRef } from 'react'
import { Footer } from '@payload-types'
import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { CMSLink } from '@/components/Link'
import Link from 'next/link'

interface FooterClientProps {
  footer: Footer
}

export const FooterClient: FC<FooterClientProps> = ({ footer }) => {
  const navItems = footer?.navItems || []
  const footerRef = useRef<HTMLDivElement>(null)

  return (
    <footer className="border-t border-border bg-brand-primary text-white">
      <div className="container py-8 gap-8 flex flex-col md:flex-row md:justify-between">
        <Link className="flex items-center" href="/">
          <picture>
            <img
              alt="Payload Logo"
              className="max-w-[6rem] invert-0"
              src="https://raw.githubusercontent.com/payloadcms/payload/main/packages/payload/src/admin/assets/images/payload-logo-light.svg"
            />
          </picture>
        </Link>

        <div className="flex flex-col-reverse items-start md:flex-row gap-4 md:items-center">
          <nav className="flex flex-col md:flex-row gap-4">
            {navItems.map(({ link }, i) => {
              return <CMSLink className="text-white" key={i} {...link} />
            })}
          </nav>
        </div>
      </div>
    </footer>
  )
}
