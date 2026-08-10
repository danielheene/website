'use client'

import React, { type JSX } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Icon } from '@/components/Icon'
import { cn } from '@/lib/cn'

import './NavLink.styles.css'

import { useConfig, useNav } from '@payloadcms/ui'

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
      >
        <Icon className="nav-link__icon" name={icon} />
        <span className="nav-link__label">{label}</span>
      </Link>
    </Tooltip>
  )
}
