import type { BlockSlug as RegisteredBlockSlug } from 'payload'

import { CodeBlock } from '@/blocks/CodeBlock'
import { LegalAuthorshipsBlock } from '@/blocks/LegalAuthorshipsBlock'
import { LegalPublisherBlock } from '@/blocks/LegalPublisherBlock'
import { LinkGroupBlock } from '@/blocks/LinkGroupBlock'
import { OneColumnContentBlock } from '@/blocks/OneColumnContentBlock'
import { ResumeAboutMeBlock } from '@/blocks/ResumeAboutMeBlock'
import { ResumeContactBlock } from '@/blocks/ResumeContactBlock'
import { ResumeCustomersBlock } from '@/blocks/ResumeCustomersBlock'
import { ResumeDownloadsBlock } from '@/blocks/ResumeDownloadsBlock'
import { ResumeExperienceBlock } from '@/blocks/ResumeExperienceBlock'
import { ResumeProjectsBlock } from '@/blocks/ResumeProjectsBlock'
import { TrendingBlogPostsBlock } from '@/blocks/TrendingBlogPostsBlock'
import { TwoColumnContentBlock } from '@/blocks/TwoColumnContentBlock'

export const BLOCKS = [
  /* general blocks */
  CodeBlock,
  LinkGroupBlock,
  OneColumnContentBlock,
  TwoColumnContentBlock,

  /* legal blocks */
  LegalPublisherBlock,
  LegalAuthorshipsBlock,

  /* resume related blocks */
  ResumeAboutMeBlock,
  ResumeContactBlock,
  ResumeCustomersBlock,
  ResumeDownloadsBlock,
  ResumeExperienceBlock,
  ResumeProjectsBlock,

  /* blog related blocks */
  TrendingBlogPostsBlock,
]

export const BLOCK_SLUGS = BLOCKS.map((block) => block.slug) as RegisteredBlockSlug[]
