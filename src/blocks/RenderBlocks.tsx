import { ElementType, Suspense } from 'react'

import { LegalAttributionsBlockRenderer } from '@/blocks/LegalAttributionsBlock/Renderer'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { extractHeadings, getBlockAnchors } from '@/lib/extractHeadings'
import { type BlockData, BlockSlug, RegisteredBlockSlug } from '@/types/blocks'

import { CodeBlockRenderer } from './CodeBlock/Renderer'
import { FeatureCardsBlockRenderer } from './FeatureCardsBlock/Renderer'
import { LegalPublisherInformationBlockRenderer } from './LegalPublisherInformationBlock/Renderer'
import { LinkGroupBlockRenderer } from './LinkGroupBlock/Renderer'
import { ResumeAboutMeBlockRenderer } from './ResumeAboutMeBlock/Renderer'
import { ResumeContactBlockRenderer } from './ResumeContactBlock/Renderer'
import { ResumeCustomersBlockRenderer } from './ResumeCustomersBlock/Renderer'
import { ResumeDownloadsBlockRenderer } from './ResumeDownloadsBlock/Renderer'
import { ResumeExperienceBlockRenderer } from './ResumeExperienceBlock/Renderer'
import { ResumeProjectsBlockRenderer } from './ResumeProjectsBlock/Renderer'
import { RichTextBlockRenderer } from './RichTextBlock/Renderer'
import { TrendingBlogPostsBlockRenderer } from './TrendingBlogPostsBlock/Renderer'

const blockComponentMap = {
  [BlockSlug.RichText]: RichTextBlockRenderer,
  [BlockSlug.LinkGroup]: LinkGroupBlockRenderer,
  [BlockSlug.Code]: CodeBlockRenderer,
  [BlockSlug.FeatureCards]: FeatureCardsBlockRenderer,
  [BlockSlug.TrendingBlogPosts]: TrendingBlogPostsBlockRenderer,
  [BlockSlug.LegalPublisherInformation]: LegalPublisherInformationBlockRenderer,
  [BlockSlug.LegalAttributions]: LegalAttributionsBlockRenderer,
  [BlockSlug.ResumeAboutMe]: ResumeAboutMeBlockRenderer,
  [BlockSlug.ResumeCustomers]: ResumeCustomersBlockRenderer,
  [BlockSlug.ResumeContact]: ResumeContactBlockRenderer,
  [BlockSlug.ResumeDownloads]: ResumeDownloadsBlockRenderer,
  [BlockSlug.ResumeExperience]: ResumeExperienceBlockRenderer,
  [BlockSlug.ResumeProjects]: ResumeProjectsBlockRenderer,
}

interface BlockRendererProps {
  blocks: BlockData<RegisteredBlockSlug>[]
}

export const RenderBlocks = ({ blocks }: BlockRendererProps) => {
  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0

  // One shared extraction, so section and heading ids are unique across the
  // page and match the navigation built from `extractHeadings(blocks)`.
  const headings = hasBlocks ? extractHeadings(blocks) : []

  return hasBlocks
    ? blocks.map((block, index) => {
        const { blockType } = block

        if (blockType && blockType in blockComponentMap) {
          const Block = blockComponentMap[
            blockType as keyof typeof blockComponentMap
          ] as ElementType

          return (
            Block && (
              /*
                Blocks are CMS-authored and several fetch live external data
                (Umami, Payload), so one failing block must not take down the
                whole page. The boundary renders nothing, letting the
                remaining blocks display normally.
              */
              <ErrorBoundary key={index} name={blockType}>
                <Suspense>
                  <Block {...block} {...getBlockAnchors(headings, index)} />
                </Suspense>
              </ErrorBoundary>
            )
          )
        }

        return null
      })
    : null
}
