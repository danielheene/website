import { type BlockData, BlockSlug } from '@custom-types'

import { CodeBlockRenderer } from './CodeBlock/Renderer'
import { LinkGroupBlockRenderer } from './LinkGroupBlock/Renderer'
import { ResumeAboutMeBlockRenderer } from './ResumeAboutMeBlock/Renderer'
import { ResumeContactBlockRenderer } from './ResumeContactBlock/Renderer'
import { ResumeCustomersBlockRenderer } from './ResumeCustomersBlock/Renderer'
import { ResumeDownloadsBlockRenderer } from './ResumeDownloadsBlock/Renderer'
import { ResumeExperienceBlockRenderer } from './ResumeExperienceBlock/Renderer'
import { ResumeProjectsBlockRenderer } from './ResumeProjectsBlock/Renderer'
import { TwoColumnContentBlockRenderer } from './TwoColumnContentBlock/Renderer'

const blockComponentMap = {
  [BlockSlug.OneColumnContent]: () => <>OneColumnContent</>,
  [BlockSlug.TwoColumnContent]: TwoColumnContentBlockRenderer,
  [BlockSlug.LinkGroup]: () => LinkGroupBlockRenderer,
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
