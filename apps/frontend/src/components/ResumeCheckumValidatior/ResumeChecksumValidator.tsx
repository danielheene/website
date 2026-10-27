import { CollectionSlug } from '@website/types/collections'
import type { ResumeDocumentData } from '@website/types/payload'

import { fetchCollection } from '@/lib/payloadClient'

import { ResumeChecksumValidatorClient } from './ResumeChecksumValidator.client'

/**
 * Kept local to the validator rather than shared with the resume page's
 * `fetchNewerDocumentVersions` (same query shape): this component still
 * lives under `src/components` while the resume page is expected to move
 * behind its own decoupled surface later, so importing across that boundary
 * would just create a dependency to unwind again. Revisit once validation
 * has a permanent home.
 */
const countNewerVersions = async (createdAt: string | null | undefined) => {
  const docs = await fetchCollection<ResumeDocumentData>(CollectionSlug.ResumeDocuments, {
    pagination: false,
    where: {
      createdAt: {
        greater_than_equal: createdAt,
      },
    },
  })

  return Math.max(0, docs.length - 1)
}

export const ResumeChecksumValidator = async () => {
  const searchChecksum = async (checksum: string) => {
    'use server'

    const docs = await fetchCollection<ResumeDocumentData>(CollectionSlug.ResumeDocuments, {
      select: {
        id: true,
        checksum_en: true,
        checksum_de: true,
        createdAt: true,
        slug: true,
      },
      where: {
        or: [
          {
            checksum_en: {
              equals: checksum,
            },
          },
          {
            checksum_de: {
              equals: checksum,
            },
          },
        ],
      },
    })

    const doc = docs[0]

    if (!doc) return null

    const newerVersions = await countNewerVersions(doc.createdAt)

    return {
      doc,
      newerVersions,
    }
  }

  return <ResumeChecksumValidatorClient searchChecksum={searchChecksum} />
}
