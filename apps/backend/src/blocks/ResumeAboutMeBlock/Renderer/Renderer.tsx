'use server'

import { ResumeAboutMeBlock } from '@website/types/payload'

import { resolveRelations } from '@/lib/resolveRelation'

import { ResumeAboutMeBlockClientRenderer } from './Renderer.client'

export const ResumeAboutMeBlockRenderer = async ({
  title,
  blockType,
  caption,
  portrait,
}: ResumeAboutMeBlock) => {
  const resolvedPortrait = await resolveRelations(portrait)

  return (
    <ResumeAboutMeBlockClientRenderer
      title={title}
      caption={caption}
      portrait={resolvedPortrait}
      blockType={blockType}
    />
  )
}
