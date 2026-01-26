import { IconName, SIDEBAR_ICON } from '@/components/Icon'
import { CollectionSlug, GlobalSlug } from '@custom-types'

export const navIconMap: Partial<Record<CollectionSlug | GlobalSlug, IconName>> = {
  [GlobalSlug.ResumeAboutMe]: SIDEBAR_ICON.RESUME_ABOUT_ME,
  [GlobalSlug.ResumeExperience]: SIDEBAR_ICON.RESUME_EXPERIENCE,
  [GlobalSlug.ResumeProjects]: SIDEBAR_ICON.RESUME_PROJECTS,
  [GlobalSlug.ResumeCustomers]: SIDEBAR_ICON.RESUME_CUSTOMERS,
  [GlobalSlug.ResumeContact]: SIDEBAR_ICON.RESUME_CONTACT,
  [GlobalSlug.ResumeDownloads]: SIDEBAR_ICON.RESUME_DOWNLOADS,
  [CollectionSlug.BlogPosts]: SIDEBAR_ICON.BLOG_POSTS,
  [CollectionSlug.BlogCategories]: SIDEBAR_ICON.BLOG_CATEGORIES,
  [CollectionSlug.BlogTags]: SIDEBAR_ICON.BLOG_TAGS,
  [CollectionSlug.Media]: SIDEBAR_ICON.MEDIA,
  [CollectionSlug.Pages]: SIDEBAR_ICON.PAGES,
  [CollectionSlug.Users]: SIDEBAR_ICON.USERS,
  [GlobalSlug.SettingsHeader]: SIDEBAR_ICON.SETTINGS_HEADER,
  [GlobalSlug.SettingsFooter]: SIDEBAR_ICON.SETTINGS_FOOTER,
  [GlobalSlug.SettingsMeta]: SIDEBAR_ICON.SETTINGS_META,
}

export const getNavIcon = (slug: string) => (Object.hasOwn(navIconMap, slug) ? navIconMap[slug as CollectionSlug | GlobalSlug] : undefined)
