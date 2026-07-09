import { CollectionSlug, CollectionSlugValue } from '@/types/collections'
import { GlobalSlug, GlobalSlugValue } from '@/types/globals'

export const SLUG_ICON_NAME_MAP: Partial<Record<CollectionSlugValue | GlobalSlugValue, string>> = {
  [GlobalSlug['ResumeAboutMe']]: 'material-symbols:fingerprint-sharp',
  [GlobalSlug['ResumeExperience']]: 'material-symbols:work-outline-sharp',
  [GlobalSlug['ResumeProjects']]: 'material-symbols:experiment-outline-sharp',
  [GlobalSlug['ResumeCustomers']]: 'material-symbols:deployed-code-account-outline-sharp',
  [GlobalSlug['ResumeContact']]: 'material-symbols:stacked-email-outline-sharp',
  [GlobalSlug['ResumeDownloads']]: 'material-symbols:picture-as-pdf-outline-sharp',
  [CollectionSlug['BlogPosts']]: 'material-symbols:post-outline',
  [CollectionSlug['BlogTags']]: 'material-symbols:label-outline-sharp',
  [CollectionSlug['MediaImages']]: 'ri:file-image-line',
  [CollectionSlug['MediaVideos']]: 'ri:file-video-line',
  [CollectionSlug['MediaAudios']]: 'ri:file-music-line',
  [CollectionSlug['MediaDocuments']]: 'ri:file-text-line',
  [CollectionSlug['Pages']]: 'material-symbols:pages-outline-sharp',
  [CollectionSlug['Users']]: 'material-symbols:account-box-outline-sharp',
  [GlobalSlug['SettingsPDFBuilder']]: 'ri:file-pdf-2-line',
  [GlobalSlug['GlobalUserSettings']]: 'material-symbols:settings-account-box-sharp',
  [GlobalSlug['SiteSettings']]: 'material-symbols:map-search-outline-sharp',
}

/**
 * Resolves an icon name based on a slug.
 */
export const resolveIconNameBySlug = (slug: string): string =>
  Object.hasOwn(SLUG_ICON_NAME_MAP, slug)
    ? SLUG_ICON_NAME_MAP[slug as CollectionSlugValue | GlobalSlugValue]
    : undefined
