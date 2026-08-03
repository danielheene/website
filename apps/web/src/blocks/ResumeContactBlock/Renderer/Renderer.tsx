'use server'

import { ResumeContactBlock } from '@/types/payload'

import { ResumeContactBlockClientRenderer } from './Renderer.client'

export const ResumeContactBlockRenderer = async ({ blockType, caption }: ResumeContactBlock) => {
  const title = 'Contact'

  return <ResumeContactBlockClientRenderer blockType={blockType} title={title} caption={caption} />
}
