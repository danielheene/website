'use server'

import type { FC } from 'react'
import type { ServerProps } from 'payload'

import { resolveRelations } from '@/lib/resolveRelation'
import { AdminPanelNavigation } from '@/types/admin-panel'

import { NavClient } from './Nav.client'

import './Nav.styles.css'

export const Nav: FC<ServerProps> = async (props) => {
  const { payload, permissions, user: userFromProps } = props

  if (!payload?.config || !permissions) return null

  const user = await resolveRelations(userFromProps)

  return <NavClient user={user} navigationConfig={AdminPanelNavigation} />
}
