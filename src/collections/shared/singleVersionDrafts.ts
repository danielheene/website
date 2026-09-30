import type { CollectionConfig, DocumentTabCondition } from 'payload'

/**
 * versions.drafts config for collections that only need a publish/unpublish
 * toggle, not browsable version history — maxPerDoc: 1 keeps just the
 * current version, so there is never a meaningful diff to show.
 */
export const SINGLE_VERSION_DRAFTS: NonNullable<CollectionConfig['versions']> = {
  drafts: {
    autosave: false,
    schedulePublish: true,
  },
  maxPerDoc: 1,
}

/**
 * Hides the edit view's Versions tab on a collection using
 * `SINGLE_VERSION_DRAFTS` — with maxPerDoc 1 the tab would only ever show the
 * current version, so it adds a click with nothing to see behind it.
 */
export const hideVersionsTabForSingleVersion: DocumentTabCondition = ({
  collectionConfig,
  permissions,
}) =>
  Boolean(
    collectionConfig?.versions &&
      typeof collectionConfig.versions === 'object' &&
      collectionConfig.versions.maxPerDoc !== 1 &&
      permissions?.collections?.[collectionConfig.slug]?.readVersions,
  )
