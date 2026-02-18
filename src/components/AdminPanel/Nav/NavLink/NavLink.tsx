'use client'

import { getTranslation } from '@payloadcms/translations'
import { useConfig, useNav, useTranslation } from '@payloadcms/ui'
import { formatAdminURL } from '@payloadcms/ui/shared'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { EntityType, StaticLabel } from 'payload'
import type { JSX } from 'react'

import { Icon } from '@/components/Icon'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/utilities/cn'

import { resolveIconNameBySlug } from '../lib/resolveIconNameBySlug'

import './NavLink.styles.scss'

interface NavLinkProps {
  slug: string
  type: EntityType
  label: StaticLabel
}

export const NavLink = ({ slug, type, label }: NavLinkProps): JSX.Element => {
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const { i18n } = useTranslation()
  const { navOpen } = useNav()

  const {
    config: {
      routes: { admin: adminRoute },
    },
  } = useConfig()

  const href = formatAdminURL({ adminRoute, path: `/${type}/${slug}` })
  const active = pathname.startsWith(href) && ['/', undefined].includes(pathname[href.length])

  const linkContent = (
    <Link className={cn(['nav-link', navOpen && 'nav-link--open', active && 'nav-link--active'])} href={href} prefetch={false}>
      <Icon className="nav-link__icon" icon={resolveIconNameBySlug(slug)} />
      <span className="nav-link__label">{getTranslation(label, i18n)}</span>
    </Link>
  )

  return !isMobile && !navOpen ? (
    <Tooltip delayDuration={500}>
      <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
      <TooltipContent side="right">
        <p>{getTranslation(label, i18n)}</p>
      </TooltipContent>
    </Tooltip>
  ) : (
    linkContent
  )
}
