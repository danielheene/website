'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { getTranslation } from '@payloadcms/translations'
import type { EntityType, StaticLabel } from 'payload'
import React, { type JSX } from 'react'

import { Icon } from '@/components/Icon'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/cn'

import { resolveIconNameBySlug } from '../lib/resolveIconNameBySlug'

import './NavLink.styles.css'

import { formatAdminURL } from 'payload/shared'

import { useConfig, useNav, useTranslation } from '@payloadcms/ui'

import { Tooltip } from '@/components/Tooltip'

interface NavLinkProps {
  slug: string
  type: EntityType
  label: StaticLabel
}

export const NavLink = ({ slug, type, label }: NavLinkProps): JSX.Element => {
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const [isHovered, setIsHovered] = React.useState(false)
  const { i18n } = useTranslation()
  const { navOpen } = useNav()

  const {
    config: {
      routes: { admin: adminRoute },
    },
  } = useConfig()

  const href = formatAdminURL({
    adminRoute,
    path: `/${type}/${slug}`,
  })

  const active = pathname.startsWith(href)

  return (
    <Tooltip content={getTranslation(label, i18n)} hidden={navOpen} side="right" align="center">
      <Link
        className={cn([
          'nav-link',
          navOpen && 'nav-link--open',
          active && 'nav-link--active',
        ])}
        href={href}
        prefetch={false}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Icon className="nav-link__icon" name={resolveIconNameBySlug(slug)} />
        <span className="nav-link__label">{getTranslation(label, i18n)}</span>
      </Link>
    </Tooltip>
  )
}
