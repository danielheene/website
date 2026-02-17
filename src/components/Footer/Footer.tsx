import { FooterLegalLinks } from '@/components/Footer/FooterLegalLinks'
import { FooterNavGroups } from '@/components/Footer/FooterNavGroups'
import { Logo } from '@/components/Logo'
import { ServiceStatus } from '@/components/ServiceStatus'
import { getCachedFooterNavigationData } from '@/lib/getFooterNavigationData'
import { cn } from '@/utilities/cn'
import { FooterNavigationData } from '@payload-types'
import Link from 'next/link'
import React from 'react'
import { FooterSocialLinks } from './FooterSocialLinks'
import { FooterThemeSwitcher } from './FooterThemeSwitcher'

interface FooterProps {
  className?: string
}

export const Footer = async ({ className = '' }: FooterProps) => {
  const { navGroups, socialLinks, legalLinks }: FooterNavigationData = await getCachedFooterNavigationData()

  return (
    <footer className={cn(['transition-colors', 'bg-background text-foreground', className])}>
      <section className="container">
        <div className="w-full pt-20 pb-10 mt-20 border-t border-foreground/50">
          <div className="flex w-full flex-row justify-between items-center mb-4">
            <Link href="/">
              <Logo variant="inline" className="h-5 md:h-6" blink />
            </Link>
            <FooterThemeSwitcher />
          </div>
          <div className="flex w-full flex-col justify-between gap-10 lg:flex-row lg:items-start lg:text-left">
            {socialLinks && <FooterSocialLinks socialLinks={socialLinks} className="w-full" />}
            {navGroups && <FooterNavGroups navGroups={navGroups} className="w-full" />}
          </div>
          <div className="mt-8 flex flex-col justify-between gap-4 border-t py-8 text-xs font-medium text-muted-foreground md:flex-row md:items-center md:text-left">
            <ServiceStatus className="mr-auto" />
            {legalLinks && <FooterLegalLinks legalLinks={legalLinks} />}
          </div>
        </div>
      </section>
    </footer>
  )
}
