import type {
  ResumeAboutMeGlobalData,
  ResumeContactGlobalData,
  ResumeCustomersGlobalData,
  ResumeDownloadsGlobalData,
  ResumeExperienceGlobalData,
  ResumeProjectsGlobalData,
  UserMetaData,
} from '@payload-types'
import type {
  BlockSlug as RegisteredBlockSlug,
  CollectionSlug as RegisteredCollectionSlug,
  GlobalSlug as RegisteredGlobalSlug,
  TypedBlock,
  TypedCollection,
  TypedGlobal,
} from 'payload'
import type { PascalCase } from 'type-fest'

/**
 *
 * ADMIN GROUPS
 *
 */
export enum AdminGroup {
  Resume = 'resume',
  Blog = 'blog',
  Media = 'media',
  General = 'general',
  Settings = 'settings',
}

/**
 *
 * BLOCK GROUPS
 *
 */
export enum BlockGroup {
  General = 'General',
  Blog = 'Blog',
  Resume = 'Resume',
}

/**
 *
 * BLOCKS
 *
 */
export enum BlockSlug {
  /* general blocks */
  Hero = 'HeroBlock',
  OneColumnContent = 'OneColumnContentBlock',
  TwoColumnContent = 'TwoColumnContentBlock',
  Code = 'CodeBlock',
  LinkGroup = 'LinkGroupBlock',

  /* resume related blocks */
  ResumeAboutMe = 'ResumeAboutMeBlock',
  ResumeCustomers = 'ResumeCustomersBlock',
  ResumeDownloads = 'ResumeDownloadsBlock',
  ResumeExperience = 'ResumeExperienceBlock',
  ResumeProjects = 'ResumeProjectsBlock',
  ResumeContact = 'ResumeContactBlock',
}

export type { BlockSlug as RegisteredBlockSlug } from 'payload'
export type BlockData<T extends RegisteredBlockSlug = RegisteredBlockSlug> = TypedBlock[T]

/**
 *
 * COLLECTIONS
 *
 */
export enum CollectionSlug {
  BlogCategories = 'blog-categories',
  BlogPosts = 'blog-posts',
  BlogTags = 'blog-tags',
  MediaImages = 'images',
  MediaVideos = 'videos',
  MediaDocuments = 'documents',
  MediaAudios = 'audios',
  Pages = 'pages',
  ResumeSkills = 'resume-skills',
  Users = 'users',
}

export type { CollectionSlug as RegisteredCollectionSlug } from 'payload'
export type CollectionData<T extends RegisteredCollectionSlug = RegisteredCollectionSlug> = TypedCollection[T]

/**
 *
 * GLOBALS
 *
 */
export enum GlobalSlug {
  SettingsHeaderNavigation = 'settings-header-navigation',
  SettingsFooterNavigation = 'settings-footer-navigation',
  SettingsCache = 'settings-cache',
  SettingsUserMeta = 'settings-user-meta',
  SettingsSiteMeta = 'settings-site-meta',
  ResumeAboutMe = 'resume-about-me',
  ResumeCustomers = 'resume-customers',
  ResumeDownloads = 'resume-downloads',
  ResumeExperience = 'resume-experience',
  ResumeProjects = 'resume-projects',
  ResumeContact = 'resume-contact',
}

export type { GlobalSlug as RegisteredGlobalSlug } from 'payload'
export type GlobalData<T extends RegisteredGlobalSlug = RegisteredGlobalSlug> = TypedGlobal[T]

/**
 * generic for resume blocks which only wraps data of its respective global
 * and serves as assistance to place global data into the layout
 */
export type ResumeLayoutBlockData<S extends RegisteredGlobalSlug> = {
  id?: string
  blockType: `${PascalCase<S>}Block`
  data: GlobalData<S>
}

export type Skill = ResumeExperienceGlobalData['skillSummary'][keyof ResumeExperienceGlobalData['skillSummary']]
export type SkillSummary = Record<keyof ResumeExperienceGlobalData['skillSummary'], Skill>

export const COLLECTION_PREFIX_MAP: Partial<Record<CollectionSlug, string>> = {
  [CollectionSlug.Pages]: '',
  [CollectionSlug.BlogPosts]: 'posts',
  [CollectionSlug.BlogCategories]: 'categories',
  [CollectionSlug.BlogTags]: 'tags',
} as const

export enum UptimeKumaHeartbeatStatus {
  Down = 0,
  Up = 1,
  Pending = 2,
  Maintenance = 3,
}

export enum UptimeKumaOverallStatus {
  AllDown = 0,
  AllUp = 1,
  PartialDown = 2,
  Maintenance = 3,
  NoServices = -1,
}

export interface UptimeKumaHeartbeat {
  status: UptimeKumaHeartbeatStatus
  time: string
  msg: string
  ping: number
}

export interface UptimeKumaHeartbeatResponse {
  heartbeatList: {
    [key: string]: UptimeKumaHeartbeat[]
  }
  uptimeList: {
    [key: string]: number
  }
}

export interface InternalStatusResponse {
  code: UptimeKumaOverallStatus
  message: string
}

export type ResumeDocumentData = {
  locale: string
  userMetaData: UserMetaData | null
  aboutMe: ResumeAboutMeGlobalData | null
  customers: ResumeCustomersGlobalData | null
  downloads: ResumeDownloadsGlobalData | null
  experience: ResumeExperienceGlobalData | null
  projects: ResumeProjectsGlobalData | null
  contact: ResumeContactGlobalData | null
}
