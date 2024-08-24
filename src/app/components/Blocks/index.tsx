import React, { Fragment } from 'react'

import type { Page } from '@payload-types'

import { ArchiveBlock } from '@/blocks/ArchiveBlock'
import { CallToActionBlock } from '@/blocks/CallToAction'
import { ContentBlock } from '@/blocks/Content'
import { FormBlock } from '@/blocks/Form'
import { MediaBlock } from '@/blocks/MediaBlock'
import { toKebabCase } from '@/utilities/toKebabCase'
import { TimelineBlock } from '@/blocks/TimelineBlock'
// import { TeaserBlock } from '../../../payload/blocks/TeaserBlock'
import { LogoCloud } from '@/components/Blocks/components/LogoCloud'

const blockComponents = {
  archive: ArchiveBlock,
  content: ContentBlock,
  cta: CallToActionBlock,
  formBlock: FormBlock,
  mediaBlock: MediaBlock,
  logoCloudBlock: LogoCloud,
  timelineBlock: TimelineBlock,
  // teaserBlock: TeaserBlock,
}

export const Blocks: React.FC<{
  blocks: Page['layout'][0][]
}> = (props) => {
  const { blocks } = props

  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0

  if (hasBlocks) {
    return (
      <Fragment>
        {blocks.map((block, index) => {
          const { blockName, blockType } = block

          if (blockType && blockType in blockComponents) {
            const Block = blockComponents[blockType]

            if (Block) {
              return (
                <div className="my-16" key={index}>
                  <Block id={toKebabCase(blockName)} {...block} />
                </div>
              )
            }
          }
          return null
        })}
      </Fragment>
    )
  }

  return null
}
