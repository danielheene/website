import type { BlockAnchors } from '@/lib/extractHeadings'
import { fetchDocumentBySlug } from '@/lib/fetchers/fetchDocumentBySlug'
import { ResumeDownloadsBlock } from '@/types/payload'

import { ResumeDownloadsBlockClientRenderer } from './Renderer.client'

export const ResumeDownloadsBlockRenderer = async ({
  anchorId,
  title,
  blockType,
  caption,
}: ResumeDownloadsBlock & BlockAnchors) => {
  const latest = await fetchDocumentBySlug({ slug: 'latest' })

  if (!latest) return null

  const { document_en, document_de, thumbnails_en, thumbnails_de } = latest

  return (
    <ResumeDownloadsBlockClientRenderer
      anchorId={anchorId}
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
