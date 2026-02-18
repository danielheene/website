import { AdminGroup, CollectionSlug, GlobalSlug } from '@custom-types'
import type { NavGroupType } from '@payloadcms/ui/utilities/groupNavItems'

const NAV_GROUP_SORTING_ORDER = [
  [AdminGroup.General, [CollectionSlug.Pages]],
  [AdminGroup.Blog, [CollectionSlug.BlogPosts, CollectionSlug.BlogCategories, CollectionSlug.BlogTags]],
  [
    AdminGroup.Resume,
    [
      GlobalSlug.ResumeAboutMe,
      GlobalSlug.ResumeExperience,
      GlobalSlug.ResumeProjects,
      GlobalSlug.ResumeCustomers,
      GlobalSlug.ResumeContact,
      GlobalSlug.ResumeDownloads,
    ],
  ],
  [AdminGroup.Media, [CollectionSlug.MediaImages, CollectionSlug.MediaVideos, CollectionSlug.MediaAudio, CollectionSlug.MediaDocuments]],
  [
    AdminGroup.Settings,
    [
      GlobalSlug.SettingsSiteMeta,
      GlobalSlug.SettingsUserMeta,
      GlobalSlug.SettingsHeaderNavigation,
      GlobalSlug.SettingsFooterNavigation,
      CollectionSlug.Users,
    ],
  ],
] as const

/**
 * Sorts navigation groups based on predefined order.
 */
export const sortNavGroups = (groups: NavGroupType[]) =>
  groups
    .sort((a, b) => {
      const aPos = NAV_GROUP_SORTING_ORDER.findIndex(([group]) => group === a.label)
      const bPos = NAV_GROUP_SORTING_ORDER.findIndex(([group]) => group === b.label)
      return (aPos === -1 ? Number.MAX_SAFE_INTEGER : aPos) - (bPos === -1 ? Number.MAX_SAFE_INTEGER : bPos)
    })
    .map(({ entities, ...group }) => {
      const entityOrder: readonly (GlobalSlug | CollectionSlug)[] = NAV_GROUP_SORTING_ORDER.find(([g]) => g === group.label)[1]

      return {
        ...group,
        entities: entityOrder
          ? entities.sort((a, b) => {
              const aPos = entityOrder.indexOf(a.slug as GlobalSlug | CollectionSlug)
              const bPos = entityOrder.indexOf(b.slug as GlobalSlug | CollectionSlug)
              return aPos - bPos
            })
          : entities,
      }
    })
