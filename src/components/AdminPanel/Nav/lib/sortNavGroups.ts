import { AdminGroup, CollectionSlug, GlobalSlug } from '@custom-types'
import { NavGroupType } from '@payloadcms/ui/utilities/groupNavItems'

const NavGroupSortingOrder = [
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
  [AdminGroup.Blog, [CollectionSlug.BlogPosts, CollectionSlug.BlogCategories, CollectionSlug.BlogTags]],
  [AdminGroup.General, [CollectionSlug.Pages, CollectionSlug.Media, CollectionSlug.Users]],
  [AdminGroup.Settings, [GlobalSlug.SettingsHeader, GlobalSlug.SettingsFooter, GlobalSlug.SettingsMeta]],
] as const

export const sortNavGroups = (groups: NavGroupType[]) =>
  groups
    .sort((a, b) => {
      const aPos = NavGroupSortingOrder.findIndex(([group]) => group === a.label)
      const bPos = NavGroupSortingOrder.findIndex(([group]) => group === b.label)
      return (aPos === -1 ? Number.MAX_SAFE_INTEGER : aPos) - (bPos === -1 ? Number.MAX_SAFE_INTEGER : bPos)
    })
    .map(({ entities, ...group }) => {
      const entityOrder: readonly (GlobalSlug | CollectionSlug)[] = NavGroupSortingOrder.find(([g]) => g === group.label)[1]

      return {
        ...group,
        entities: entityOrder
          ? entities.sort((a, b) => {
              const aPos = entityOrder.findIndex((slug) => slug === a.slug)
              const bPos = entityOrder.findIndex((slug) => slug === b.slug)
              return aPos - bPos
            })
          : entities,
      }
    })
