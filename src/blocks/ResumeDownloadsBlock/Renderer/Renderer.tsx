'use server'

import { fetchLatestResumeDocumentCore } from '@/lib/fetchers/fetchLatestResumeDocumentCore'
import { ResumeDownloadsBlock } from '@/types/payload'

import { ResumeDownloadsBlockClientRenderer } from './Renderer.client'

export const ResumeDownloadsBlockRenderer = async ({
  title,
  blockType,
  caption,
}: ResumeDownloadsBlock) => {
  const latest = await fetchLatestResumeDocumentCore()
  if (!latest) return null

  const { document_en, document_de, thumbnails_en, thumbnails_de } = latest

  return (
    <ResumeDownloadsBlockClientRenderer
      title={title}
      blockType={blockType}
      caption={caption}
      document_en={document_en.value}
      document_de={document_de.value}
      thumbnails_en={thumbnails_en.map((v) => v.value)}
      thumbnails_de={thumbnails_de.map((v) => v.value)}
    />
  )
}
