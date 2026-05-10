import { type BlockData, BlockSlug } from '@/types/blocks'

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
  blocks: BlockData[]
}

export const RenderBlocks = ({ blocks }: BlockRendererProps) => {
  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0

  if (!hasBlocks) return null

  return blocks.map((block, index) => {
    const { blockType, id } = block

    if (blockType && blockType in blockComponentMap) {
      const Block = blockComponentMap[blockType as keyof typeof blockComponentMap]

      return <Block key={id || index} {...block} />
    }

    if (process.env.NODE_ENV === 'development') {
      console.warn(`No renderer found for block type: ${blockType}`)
    }

    return null
  })
}
