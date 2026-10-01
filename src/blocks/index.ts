import type { BlockSlug as RegisteredBlockSlug } from 'payload'

import { CodeBlock } from '@/blocks/CodeBlock'
import { FeatureCardsBlock } from '@/blocks/FeatureCardsBlock'
import { HighlightBoxBlock } from '@/blocks/HighlightBoxBlock'
import { LegalAuthorshipsBlock } from '@/blocks/LegalAuthorshipsBlock'
import { LegalPublisherBlock } from '@/blocks/LegalPublisherBlock'
import { LinkGroupBlock } from '@/blocks/LinkGroupBlock'
import { ResumeAboutMeBlock } from '@/blocks/ResumeAboutMeBlock'
import { ResumeContactBlock } from '@/blocks/ResumeContactBlock'
import { ResumeCustomersBlock } from '@/blocks/ResumeCustomersBlock'
import { ResumeDownloadsBlock } from '@/blocks/ResumeDownloadsBlock'
import { ResumeExperienceBlock } from '@/blocks/ResumeExperienceBlock'
import { ResumeProjectsBlock } from '@/blocks/ResumeProjectsBlock'
import { RichTextBlock } from '@/blocks/RichTextBlock'
import { TrendingBlogPostsBlock } from '@/blocks/TrendingBlogPostsBlock'
import { TwoColumnContentBlock } from '@/blocks/TwoColumnContentBlock'
import { BlockSlug } from '@/types/blocks'

export const BLOCKS = [
  /* general blocks */
  CodeBlock,
  FeatureCardsBlock,
  HighlightBoxBlock,
  LinkGroupBlock,
  RichTextBlock,
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

/**
 * Every block, registered once at config level so both page layouts and
 * Lexical's BlocksFeature can reference them by slug.
 */
export const BLOCK_SLUGS = BLOCKS.map((block) => block.slug) as RegisteredBlockSlug[]

/** Blocks that only exist inside a rich-text editor, never as a page section. */
export const LEXICAL_ONLY_BLOCK_SLUGS: RegisteredBlockSlug[] = [BlockSlug.TwoColumnContent]

export const PAGE_BLOCK_SLUGS = BLOCK_SLUGS.filter(
  (slug) => !LEXICAL_ONLY_BLOCK_SLUGS.includes(slug),
)
