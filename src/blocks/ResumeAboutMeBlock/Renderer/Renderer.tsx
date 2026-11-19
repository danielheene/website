import type { BlockAnchors } from '@/lib/extractHeadings'
import { resolveRelations } from '@/lib/resolveRelation'
import { ResumeAboutMeBlock } from '@/types/payload'

import { ResumeAboutMeBlockClientRenderer } from './Renderer.client'

export const ResumeAboutMeBlockRenderer = async ({
  anchorId,
  title,
  blockType,
  caption,
  portrait,
}: ResumeAboutMeBlock & BlockAnchors) => {
  const resolvedPortrait = await resolveRelations(portrait)

  return (
    <ResumeAboutMeBlockClientRenderer
      anchorId={anchorId}
      title={title}
      caption={caption}
      portrait={resolvedPortrait}
      blockType={blockType}
    />
  )
}
