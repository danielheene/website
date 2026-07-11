import type { FC } from 'react'
import type { ServerProps } from 'payload'

import { buildNavGroups } from './lib/buildNavGroups'
import { fetchNavPreferences } from './lib/fetchNavPreferences'
import { sortNavGroups } from './lib/sortNavGroups'

import './Nav.styles.css'

import { NavFooter } from '@/components/AdminPanel/Nav/NavFooter'
import { NavHeader } from '@/components/AdminPanel/Nav/NavHeader'
import { resolveRelations } from '@/lib/resolveRelation'
import { isMediaImage } from '@/lib/typeGuards'

import { NavGroup } from './NavGroup'
import { NavWrapper } from './NavWrapper'

export const baseClass = 'nav'

export const Nav: FC<ServerProps> = async (props) => {
  const {
    documentSubViewType,
    i18n,
    locale,
    params,
    payload,
    permissions,
    searchParams,
    user: userFromProps,
    viewType,
    visibleEntities,
  } = props

  if (!payload?.config || !permissions) return null

  const user = await resolveRelations(userFromProps)

  const {
    admin: {
      components: { afterNavLinks, beforeNavLinks },
    },
    collections,
    globals,
  } = payload.config

  const navGroups = sortNavGroups(
    buildNavGroups({
      collections,
      globals,
      visibleEntities,
      permissions,
      i18n,
    }),
  )
  const _navPreferences = await fetchNavPreferences({
    payload,
    user,
  })

  // return (
  //   <NavWrapper>
  //     <NavHeader />
  //     {RenderServerComponent({
  //       clientProps: {
  //         documentSubViewType,
  //         viewType,
  //       },
  //       Component: beforeNavLinks,
  //       importMap: payload.importMap,
  //       serverProps: {
  //         i18n,
  //         locale,
  //         params,
  //         payload,
  //         permissions,
  //         searchParams,
  //         user,
  //       },
  //     })}
  //     {navGroups.map(({ entities, label }, key) => {
  //       return <NavGroup key={key} label={label} entities={entities} />
  //     })}
  //     {RenderServerComponent({
  //       clientProps: {
  //         documentSubViewType,
  //         viewType,
  //       },
  //       Component: afterNavLinks,
  //       importMap: payload.importMap,
  //       serverProps: {
  //         i18n,
  //         locale,
  //         params,
  //         payload,
  //         permissions,
  //         searchParams,
  //         user,
  //       },
  //     })}
  //     <NavFooter
  //       user={{
  //         avatar: isMediaImage(user.avatar) && user.avatar.url,
  //         name: user.name || '',
  //         email: user.email,
  //       }}
  //     />
  //   </NavWrapper>
  // )
  return (
    <NavWrapper
      header={<NavHeader key="nav-header" />}
      footer={
        <NavFooter
          key="nav-footer"
          avatarSrc={user.avatar.value?.url}
          email={user.email}
          name={user.name || ''}
        />
      }
    >
      {navGroups.map(({ entities, label }, key) => {
        return <NavGroup key={key} label={label} entities={entities} />
      })}
    </NavWrapper>
  )
}
