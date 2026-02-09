import { I18nClient } from '@payloadcms/translations'
import { EntityToGroup, groupNavItems, NavGroupType } from '@payloadcms/ui/utilities/groupNavItems'
import { EntityType, SanitizedCollectionConfig, SanitizedGlobalConfig, SanitizedPermissions, VisibleEntities } from 'payload'

interface BuildNavGroupsParams {
  collections: SanitizedCollectionConfig[]
  globals: SanitizedGlobalConfig[]
  visibleEntities: VisibleEntities
  permissions: SanitizedPermissions
  i18n: I18nClient
}

/**
 * Builds navigation groups for the admin panel based on visible collections and globals.
 */
export const buildNavGroups = ({ collections, globals, visibleEntities, permissions, i18n }: BuildNavGroupsParams): NavGroupType[] => {
  return groupNavItems(
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
}
