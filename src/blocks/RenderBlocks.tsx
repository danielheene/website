import { ElementType, Suspense } from 'react'

import { ErrorBoundary } from '@/components/ErrorBoundary'
import { type BlockData, BlockSlug, RegisteredBlockSlug } from '@/types/blocks'

import { CodeBlockRenderer } from './CodeBlock/Renderer'
import { LegalAuthorshipsBlockRenderer } from './LegalAuthorshipsBlock/Renderer'
import { LegalPublisherBlockRenderer } from './LegalPublisherBlock/Renderer'
import { LinkGroupBlockRenderer } from './LinkGroupBlock/Renderer'
import { OneColumnContentBlockRenderer } from './OneColumnContentBlock/Renderer'
import { ResumeAboutMeBlockRenderer } from './ResumeAboutMeBlock/Renderer'
import { ResumeContactBlockRenderer } from './ResumeContactBlock/Renderer'
import { ResumeCustomersBlockRenderer } from './ResumeCustomersBlock/Renderer'
import { ResumeDownloadsBlockRenderer } from './ResumeDownloadsBlock/Renderer'
import { ResumeExperienceBlockRenderer } from './ResumeExperienceBlock/Renderer'
import { ResumeProjectsBlockRenderer } from './ResumeProjectsBlock/Renderer'
import { TrendingBlogPostsBlockRenderer } from './TrendingBlogPostsBlock/Renderer'
import { TwoColumnContentBlockRenderer } from './TwoColumnContentBlock/Renderer'

const blockComponentMap = {
  [BlockSlug.OneColumnContent]: OneColumnContentBlockRenderer,
  [BlockSlug.TwoColumnContent]: TwoColumnContentBlockRenderer,
  [BlockSlug.LinkGroup]: LinkGroupBlockRenderer,
  [BlockSlug.Code]: CodeBlockRenderer,
  [BlockSlug.TrendingBlogPosts]: TrendingBlogPostsBlockRenderer,
  [BlockSlug.LegalPublisher]: LegalPublisherBlockRenderer,
  [BlockSlug.LegalAuthorships]: LegalAuthorshipsBlockRenderer,
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
                whole page. The boundary reports to Sentry and renders nothing,
                letting the remaining blocks display normally.
              */
              <ErrorBoundary key={index} name={blockType}>
                <Suspense>
                  <Block {...block} />
                </Suspense>
              </ErrorBoundary>
            )
          )
        }

        return null
      })
    : null
}
