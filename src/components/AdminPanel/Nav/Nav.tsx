import { RenderServerComponent } from '@payloadcms/ui/elements/RenderServerComponent'
import type { ServerProps } from 'payload'
import type { FC } from 'react'

import { isMediaImage } from '@/lib/typeGuards'

import { buildNavGroups } from './lib/buildNavGroups'
import { fetchNavPreferences } from './lib/fetchNavPreferences'
import { sortNavGroups } from './lib/sortNavGroups'
import { NavFooter } from './NavFooter'
import { NavGroup } from './NavGroup'
import { NavHeader } from './NavHeader'
import { NavWrapper } from './NavWrapper'

import './Nav.styles.scss'

export const baseClass = 'nav'

export const Nav: FC<ServerProps> = async (props) => {
  const { documentSubViewType, i18n, locale, params, payload, permissions, searchParams, user, viewType, visibleEntities } = props

  if (!payload?.config || !permissions) return null

  const {
    admin: {
      components: { afterNavLinks, beforeNavLinks },
    },
    collections,
    globals,
  } = payload.config

  const navGroups = sortNavGroups(buildNavGroups({ collections, globals, visibleEntities, permissions, i18n }))
  const _navPreferences = await fetchNavPreferences({ payload, user })

  return (
    <NavWrapper>
      <NavHeader />
      {RenderServerComponent({
        clientProps: {
          documentSubViewType,
          viewType,
        },
        Component: beforeNavLinks,
        importMap: payload.importMap,
        serverProps: {
          i18n,
          locale,
          params,
          payload,
          permissions,
          searchParams,
          user,
        },
      })}
      {navGroups.map(({ entities, label }, key) => {
        return <NavGroup key={key} label={label} entities={entities} />
      })}
      {RenderServerComponent({
        clientProps: {
          documentSubViewType,
          viewType,
        },
        Component: afterNavLinks,
        importMap: payload.importMap,
        serverProps: {
          i18n,
          locale,
          params,
          payload,
          permissions,
          searchParams,
          user,
        },
      })}
      <NavFooter
        user={{
          avatar: isMediaImage(user.avatar) && user.avatar.url,
          name: user.name || '',
          email: user.email,
        }}
      />
    </NavWrapper>
  )
}
