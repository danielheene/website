import type { BlockSlug as RegisteredBlockSlug, TypedBlock, TypedGlobal } from 'payload'

import type { PascalCase } from 'type-fest'

import type { BilingualLanguage, ReducedToBilingualLanguage } from '@/lib/i18n'
import { ResolvedRelations } from '@/lib/resolveRelation'
import type { GlobalData, RegisteredGlobalSlug } from '@/types/globals'

/**
 *
 * BLOCK GROUPS
 *
 */
export const BlockGroup = {
  General: 'General',
  Blog: 'Blog',
  Resume: 'Resume',
  Legal: 'Legal',
} as const

export type BlockGroup = typeof BlockGroup
export type BlockGroupKey = keyof BlockGroup & string
export type BlockGroupValue = BlockGroup[BlockGroupKey] & string

/**
 * Block Slugs
 */
export const BlockSlug = {
  /* general blocks */
  OneColumnContent: 'OneColumnContentBlock',
  TwoColumnContent: 'TwoColumnContentBlock',
  Code: 'CodeBlock',
  LinkGroup: 'LinkGroupBlock',

  /* blog related blocks */
  TrendingBlogPosts: 'TrendingBlogPostsBlock',

  /* legal blocks */
  LegalPublisher: 'LegalPublisherBlock',
  LegalAuthorships: 'LegalAuthorshipsBlock',

  /* resume related blocks */
  ResumeAboutMe: 'ResumeAboutMeBlock',
  ResumeCustomers: 'ResumeCustomersBlock',
  ResumeDownloads: 'ResumeDownloadsBlock',
  ResumeExperience: 'ResumeExperienceBlock',
  ResumeProjects: 'ResumeProjectsBlock',
  ResumeContact: 'ResumeContactBlock',
} as const

export type BlockSlug = typeof BlockSlug
export type BlockSlugKey = keyof BlockSlug & string
export type BlockSlugValue = BlockSlug[BlockSlugKey] & string

export type { BlockSlug as RegisteredBlockSlug } from 'payload'
export type BlockData<
  T extends RegisteredBlockSlug = RegisteredBlockSlug & string,
  L extends BilingualLanguage = 'en',
> = ReducedToBilingualLanguage<ResolvedRelations<TypedBlock[T]>, L>

/**
 * generic for resume blocks that only wraps data of its respective global
 * and serves as assistance to place global data into the layout
 */
export type ResumeLayoutBlockData<S extends RegisteredGlobalSlug> = {
  id?: string
  blockType: `${PascalCase<S>}Block`
  data: ReducedToBilingualLanguage<GlobalData<S>>
}
