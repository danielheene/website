import type { DigitalDocumentLeaf, ImageObjectLeaf, MediaObjectLeaf } from 'schema-dts'

import { jsonLdIds } from './ids'

export interface DocumentFile {
  url: string
  /** BCP 47 language tag. */
  language: string
  /** The SHA-256 checksum the page lets visitors validate a copy against. */
  sha256?: string | null
  bytes?: number | null
}

export interface DigitalDocumentData {
  siteUrl: string
  url: string
  name: string
  description?: string | null
  dateCreated?: string | null
  files: DocumentFile[]
  thumbnail?: ImageObjectLeaf
}

/** A generated resume PDF, one encoding per language. */
export function generateDigitalDocument(data: DigitalDocumentData): DigitalDocumentLeaf {
  const personId = jsonLdIds(data.siteUrl).person

  const document: DigitalDocumentLeaf = {
    '@type': 'DigitalDocument',
    '@id': `${data.url}#document`,
    url: data.url,
    name: data.name,
    author: {
      '@id': personId,
    },
    about: {
      '@id': personId,
    },
  }

  if (data.description) document.description = data.description

  if (data.dateCreated) document.dateCreated = data.dateCreated

  if (data.thumbnail) document.thumbnail = data.thumbnail

  const encodings = data.files.map((file): MediaObjectLeaf => {
    const encoding: MediaObjectLeaf = {
      '@type': 'MediaObject',
      contentUrl: file.url,
      encodingFormat: 'application/pdf',
      inLanguage: file.language,
    }

    if (file.sha256) encoding.sha256 = file.sha256

    if (file.bytes) encoding.contentSize = `${file.bytes} B`

    return encoding
  })

  if (encodings.length > 0) {
    document.encoding = encodings
    document.inLanguage = data.files.map(({ language }) => language)
  }

  return document
}
