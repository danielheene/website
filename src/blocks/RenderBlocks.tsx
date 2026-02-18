import { type BlockData, BlockSlug } from '@custom-types'

import { ResumeDownloadsBlockRenderer } from '@/blocks/ResumeDownloadsBlock'

import { ResumeAboutMeBlockRenderer } from './ResumeAboutMeBlock'
import { ResumeContactBlockRenderer } from './ResumeContactBlock'
import { ResumeCustomersBlockRenderer } from './ResumeCustomersBlock'
import { ResumeExperienceBlockRenderer } from './ResumeExperienceBlock'
import { ResumeProjectsBlockRenderer } from './ResumeProjectsBlock'

const blockComponentMap = {
  [BlockSlug.OneColumnContent]: () => <>OneColumnContent</>,
  [BlockSlug.TwoColumnContent]: () => <>TwoColumnContent</>,
  [BlockSlug.LinkGroup]: () => <>LinkGroup</>,
  // [BlockSlug.Code]: CodeBlockRenderer,
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

  return hasBlocks
    ? blocks.map((block, index) => {
        const { blockType } = block

        if (blockType && blockType in blockComponentMap) {
          const Block = blockComponentMap[blockType]

          // @ts-expect-error
          return Block && <Block key={index} {...block} />
        }

        return null
      })
    : null
}
