import type { BlockAnchors } from '@/lib/extractHeadings'
import { ResumeContactBlock } from '@/types/payload'

import { ResumeContactBlockClientRenderer } from './Renderer.client'

export const ResumeContactBlockRenderer = async ({
  anchorId,
  title,
  blockType,
  caption,
}: ResumeContactBlock & BlockAnchors) => {
  return (
    <ResumeContactBlockClientRenderer
      anchorId={anchorId}
      blockType={blockType}
      title={title}
      caption={caption}
    />
  )
}
