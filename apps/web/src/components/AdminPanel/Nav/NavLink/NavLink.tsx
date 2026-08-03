'use client'

import React, { type JSX } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Icon } from '@/components/Icon'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@repo/utils/cn'

import './NavLink.styles.css'

import { useConfig, useNav, useTranslation } from '@payloadcms/ui'

import { formatAdminURL } from 'payload/shared'

import { Tooltip } from '@/components/Tooltip'
import { AdminNavigationTypeValue } from '@/types/admin-panel'
import { CollectionSlugValue } from '@/types/collections'
import { GlobalSlugValue } from '@/types/globals'

interface NavLinkProps {
  slug: CollectionSlugValue | GlobalSlugValue
  type: AdminNavigationTypeValue
  label: string
  icon: string
}

export const NavLink = ({ slug, type, label, icon }: NavLinkProps): JSX.Element => {
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
    <Tooltip content={label} hidden={navOpen} side="right" align="center">
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
        <Icon className="nav-link__icon" name={icon} />
        <span className="nav-link__label">{label}</span>
      </Link>
    </Tooltip>
  )
}
