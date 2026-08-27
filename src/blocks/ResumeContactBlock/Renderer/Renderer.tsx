'use server'

import { ResumeContactBlock } from '@/types/payload'

import { ResumeContactBlockClientRenderer } from './Renderer.client'

export const ResumeContactBlockRenderer = async ({
  title,
  blockType,
  caption,
}: ResumeContactBlock) => {
  return <ResumeContactBlockClientRenderer blockType={blockType} title={title} caption={caption} />
}
