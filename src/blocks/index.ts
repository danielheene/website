import type { BlockSlug as RegisteredBlockSlug } from 'payload'

import { LinkGroupBlock } from '@/blocks/LinkGroupBlock'
import { OneColumnContentBlock } from '@/blocks/OneColumnContentBlock'
import { ResumeAboutMeBlock } from '@/blocks/ResumeAboutMeBlock'
import { ResumeContactBlock } from '@/blocks/ResumeContactBlock'
import { ResumeCustomersBlock } from '@/blocks/ResumeCustomersBlock'
import { ResumeDownloadsBlock } from '@/blocks/ResumeDownloadsBlock'
import { ResumeExperienceBlock } from '@/blocks/ResumeExperienceBlock'
import { ResumeProjectsBlock } from '@/blocks/ResumeProjectsBlock'
import { TwoColumnContentBlock } from '@/blocks/TwoColumnContentBlock'

export const BLOCKS = [
  /* general blocks */
  // CodeBlock,
  LinkGroupBlock,
  OneColumnContentBlock,
  TwoColumnContentBlock,

  /* resume related blocks */
  ResumeAboutMeBlock,
  ResumeContactBlock,
  ResumeCustomersBlock,
  ResumeDownloadsBlock,
  ResumeExperienceBlock,
  ResumeProjectsBlock,
]

export const BLOCK_SLUGS = BLOCKS.map((block) => block.slug) as RegisteredBlockSlug[]
