import type { NavGroupType } from '@payloadcms/ui/utilities/groupNavItems'

import { AdminGroup } from '@custom-types'

import { CollectionSlug, CollectionSlugValue } from '@/types/collections'
import { GlobalSlug, GlobalSlugValue } from '@/types/globals'

const NAV_GROUP_SORTING_ORDER = [
  [
    AdminGroup.General,
    [
      CollectionSlug['Pages'],
    ],
  ],
  [
    AdminGroup.Blog,
    [
      CollectionSlug['BlogPosts'],
      CollectionSlug['BlogTags'],
    ],
  ],
  [
    AdminGroup.Resume,
    [
      GlobalSlug['ResumeAboutMe'],
      GlobalSlug['ResumeExperience'],
      GlobalSlug['ResumeProjects'],
      GlobalSlug['ResumeCustomers'],
      GlobalSlug['ResumeContact'],
      GlobalSlug['ResumeDownloads'],
      CollectionSlug['ResumeSkills'],
      CollectionSlug['ResumeJobs'],
      CollectionSlug['ResumeDocuments'],
      CollectionSlug['ResumeFiles'],
    ],
  ],
  [
    AdminGroup.Media,
    [
      CollectionSlug['MediaImages'],
      CollectionSlug['MediaVideos'],
      CollectionSlug['MediaAudios'],
      CollectionSlug['MediaDocuments'],
    ],
  ],
  [
    AdminGroup.Settings,
    [
      GlobalSlug['SiteSettings'],
      GlobalSlug['GlobalUserSettings'],
      GlobalSlug['SettingsPDFBuilder'],
      CollectionSlug['Users'],
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
      return (
        (aPos === -1 ? Number.MAX_SAFE_INTEGER : aPos) -
        (bPos === -1 ? Number.MAX_SAFE_INTEGER : bPos)
      )
    })
    .map(({ entities, ...group }) => {
      const entityOrder: readonly (GlobalSlugValue | CollectionSlugValue)[] = NAV_GROUP_SORTING_ORDER.find(
        ([g]) => g === group.label,
      )?.[1]

      return {
        ...group,
        entities: entityOrder
          ? entities
            .filter((entity) => entityOrder.includes(entity.slug as GlobalSlugValue | CollectionSlugValue))
            .sort((a, b) => {
              const aPos = entityOrder.indexOf(a.slug as GlobalSlugValue | CollectionSlugValue)
              const bPos = entityOrder.indexOf(b.slug as GlobalSlugValue | CollectionSlugValue)
              return aPos - bPos
            })
          : entities,
      }
    })
