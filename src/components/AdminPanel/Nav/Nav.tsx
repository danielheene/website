import type { FC } from 'react'
import { Suspense } from 'react'
import type { ServerProps } from 'payload'

import { AdminPanelNavigation } from '@/types/admin-panel'

import { NavClient } from './Nav.client'
import { NavFooterAsync } from './NavFooter/NavFooterAsync'
import { NavFooterSkeleton } from './NavFooter/NavFooterSkeleton'

import './Nav.styles.css'

export const Nav: FC<ServerProps> = (props) => {
  const { payload, permissions, user } = props

  if (!payload?.config || !permissions) return null

  return (
    <NavClient
      navigationConfig={AdminPanelNavigation}
      footer={
        <Suspense fallback={<NavFooterSkeleton />}>
          <NavFooterAsync user={user} />
        </Suspense>
      }
    />
  )
}
