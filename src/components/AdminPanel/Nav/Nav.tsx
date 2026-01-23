import { sortNavGroups } from '@/payload/utilities/sortAdminGroups'
import { EntityToGroup, groupNavItems, NavGroupType } from '@payloadcms/ui/utilities/groupNavItems'
import { EntityType, ServerProps } from 'payload'
import { FC } from 'react'

export const Nav: FC<ServerProps> = (props) => {
  const { documentSubViewType, i18n, locale, params, payload, permissions, searchParams, user, viewType, visibleEntities } = props

  if (!payload?.config || !permissions) {
    return null
  }

  const {
    admin: {
      components: { afterNavLinks, beforeNavLinks, logout },
    },
    collections,
    globals,
  } = payload.config

  const navGroups: NavGroupType[] = groupNavItems(
    [
      ...collections
        .filter(({ slug }) => visibleEntities?.collections.includes(slug))
        .map(
          (collection) =>
            ({
              type: EntityType.collection,
              entity: collection,
            }) satisfies EntityToGroup,
        ),
      ...globals
        .filter(({ slug }) => visibleEntities?.globals.includes(slug))
        .map(
          (global) =>
            ({
              type: EntityType.global,
              entity: global,
            }) satisfies EntityToGroup,
        ),
    ],
    permissions,
    i18n,
  )

  const sortedNavGroups = sortNavGroups(navGroups)

  return (
    <ul>
      {sortedNavGroups.map(({ label }) => (
        <li key={label}>{label}</li>
      ))}
    </ul>
  )
}
