import {
  BlockSlug as RegisteredBlockSlug,
  CollectionSlug as RegisteredCollectionSlug,
  GlobalSlug as RegisteredGlobalSlug,
  TypedBlock,
  TypedCollection,
  TypedGlobal,
} from 'payload'
import { PascalCase } from 'type-fest'

/**
 *
 * ADMIN GROUPS
 *
 */
export enum AdminGroup {
  Resume = 'resume',
  Blog = 'blog',
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
  Media = 'media',
  Pages = 'pages',
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
  SettingsHeader = 'settings-header',
  SettingsFooter = 'settings-footer',
  SettingsCache = 'settings-cache',
  SettingsMeta = 'settings-meta',
  ResumeAboutMe = 'resume-about-me',
  ResumeCustomers = 'resume-customers',
  ResumeDownloads = 'resume-downloads',
  ResumeExperience = 'resume-experience',
  ResumeProjects = 'resume-projects',
  ResumeContact = 'resume-contact',
}
export type { GlobalSlug as RegisteredGlobalSlug } from 'payload'
export type GlobalData<T extends RegisteredGlobalSlug> = TypedGlobal[T]

/**
 * generic for resume blocks which only wraps data of its respective global
 * and serves as assistance to place global data into the layout
 */
export type ResumeLayoutBlockData<S extends RegisteredGlobalSlug> = {
  id?: string
  blockType: `${PascalCase<S>}Block`
  data: GlobalData<S>
}

export const COLLECTION_PREFIX_MAP: Partial<Record<CollectionSlug, string>> = {
  [CollectionSlug.Pages]: '',
  [CollectionSlug.BlogPosts]: 'posts',
  [CollectionSlug.BlogCategories]: 'categories',
  [CollectionSlug.BlogTags]: 'tags',
} as const
