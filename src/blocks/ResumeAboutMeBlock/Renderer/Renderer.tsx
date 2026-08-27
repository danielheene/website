'use server'

import { cacheTag } from 'next/cache'

import { resolveRelations } from '@/lib/resolveRelation'
import { ResumeAboutMeBlock } from '@/types/payload'

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
