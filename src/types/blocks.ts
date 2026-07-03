import type { BlockSlug as RegisteredBlockSlug, TypedBlock } from 'payload'
import type { PascalCase } from 'type-fest'

import type { ReducedToLocale } from '@/lib/i18n'
import type { GlobalData, RegisteredGlobalSlug } from '@/types/globals'

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
  OneColumnContent = 'OneColumnContentBlock',
  TwoColumnContent = 'TwoColumnContentBlock',
  Code = 'CodeBlock',
  LinkGroup = 'LinkGroupBlock',
  // LegalAddress = 'LegalAddressBlock',

  /* resume related blocks */
  ResumeAboutMe = 'ResumeAboutMeBlock',
  ResumeCustomers = 'ResumeCustomersBlock',
  ResumeDownloads = 'ResumeDownloadsBlock',
  ResumeExperience = 'ResumeExperienceBlock',
  ResumeProjects = 'ResumeProjectsBlock',
  ResumeContact = 'ResumeContactBlock',
}

export type { BlockSlug as RegisteredBlockSlug } from 'payload'
export type BlockData<T extends RegisteredBlockSlug = RegisteredBlockSlug> =
  TypedBlock[T]

/**
 * generic for resume blocks that only wraps data of its respective global
 * and serves as assistance to place global data into the layout
 */
export type ResumeLayoutBlockData<S extends RegisteredGlobalSlug> = {
  id?: string
  blockType: `${PascalCase<S>}Block`
  data: ReducedToLocale<GlobalData<S>>
}
