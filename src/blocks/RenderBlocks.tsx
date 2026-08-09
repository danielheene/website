import { ElementType, Suspense } from 'react'

import { type BlockData, BlockSlug, RegisteredBlockSlug } from '@/types/blocks'

import { CodeBlockRenderer } from './CodeBlock/Renderer'
import { LinkGroupBlockRenderer } from './LinkGroupBlock/Renderer'
import { OneColumnContentBlockRenderer } from './OneColumnContentBlock/Renderer'
import { ResumeAboutMeBlockRenderer } from './ResumeAboutMeBlock/Renderer'
import { ResumeContactBlockRenderer } from './ResumeContactBlock/Renderer'
import { ResumeCustomersBlockRenderer } from './ResumeCustomersBlock/Renderer'
import { ResumeDownloadsBlockRenderer } from './ResumeDownloadsBlock/Renderer'
import { ResumeExperienceBlockRenderer } from './ResumeExperienceBlock/Renderer'
import { ResumeProjectsBlockRenderer } from './ResumeProjectsBlock/Renderer'
import { TwoColumnContentBlockRenderer } from './TwoColumnContentBlock/Renderer'

const blockComponentMap = {
  [BlockSlug.OneColumnContent]: OneColumnContentBlockRenderer,
  [BlockSlug.TwoColumnContent]: TwoColumnContentBlockRenderer,
  [BlockSlug.LinkGroup]: LinkGroupBlockRenderer,
  [BlockSlug.Code]: CodeBlockRenderer,
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
              <Suspense key={index}>
                <Block key={index} {...block} />
              </Suspense>
            )
          )
        }

        return null
      })
    : null
}
