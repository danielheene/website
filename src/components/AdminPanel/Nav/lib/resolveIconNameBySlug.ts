import { CollectionSlug, GlobalSlug } from '@custom-types'

import { type IconName, SIDEBAR_ICON } from '@/components/Icon'

export const SLUG_ICON_NAME_MAP: Partial<Record<CollectionSlug | GlobalSlug, IconName>> = {
  [GlobalSlug.ResumeAboutMe]: SIDEBAR_ICON.RESUME_ABOUT_ME,
  [GlobalSlug.ResumeExperience]: SIDEBAR_ICON.RESUME_EXPERIENCE,
  [GlobalSlug.ResumeProjects]: SIDEBAR_ICON.RESUME_PROJECTS,
  [GlobalSlug.ResumeCustomers]: SIDEBAR_ICON.RESUME_CUSTOMERS,
  [GlobalSlug.ResumeContact]: SIDEBAR_ICON.RESUME_CONTACT,
  [GlobalSlug.ResumeDownloads]: SIDEBAR_ICON.RESUME_DOWNLOADS,
  [CollectionSlug.BlogPosts]: SIDEBAR_ICON.BLOG_POSTS,
  [CollectionSlug.BlogCategories]: SIDEBAR_ICON.BLOG_CATEGORIES,
  [CollectionSlug.BlogTags]: SIDEBAR_ICON.BLOG_TAGS,
  [CollectionSlug.MediaImages]: SIDEBAR_ICON.MEDIA_IMAGES,
  [CollectionSlug.MediaVideos]: SIDEBAR_ICON.MEDIA_VIDEOS,
  [CollectionSlug.MediaAudios]: SIDEBAR_ICON.MEDIA_AUDIOS,
  [CollectionSlug.MediaDocuments]: SIDEBAR_ICON.MEDIA_DOCUMENTS,
  [CollectionSlug.Pages]: SIDEBAR_ICON.PAGES,
  [CollectionSlug.Users]: SIDEBAR_ICON.USERS,
  [GlobalSlug.SettingsHeaderNavigation]: SIDEBAR_ICON.SETTINGS_HEADER,
  [GlobalSlug.SettingsUserMeta]: SIDEBAR_ICON.SETTINGS_USER_DATA,
  [GlobalSlug.SettingsFooterNavigation]: SIDEBAR_ICON.SETTINGS_FOOTER,
  [GlobalSlug.SettingsSiteMeta]: SIDEBAR_ICON.SETTINGS_META,
}

/**
 * Resolves an icon name based on a slug.
 */
export const resolveIconNameBySlug = (slug: string): IconName | undefined =>
  Object.hasOwn(SLUG_ICON_NAME_MAP, slug) ? SLUG_ICON_NAME_MAP[slug as CollectionSlug | GlobalSlug] : undefined
