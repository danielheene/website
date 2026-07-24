'use server'

import { ResumeDownloadsBlock } from '@/types/payload'

import { ResumeDownloadsBlockClientRenderer } from './Renderer.client'

export const ResumeDownloadsBlockRenderer = async ({
  blockType,
  caption,
}: ResumeDownloadsBlock) => {
  const title = 'Downloads'

  return (
    <ResumeDownloadsBlockClientRenderer title={title} blockType={blockType} caption={caption} />
  )
}
