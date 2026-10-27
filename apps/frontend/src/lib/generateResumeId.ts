import { CollectionSlug } from '@website/types/collections'
import { customAlphabet } from 'nanoid'

import { countCollection } from '@/lib/payloadClient'

// 5-letter A-Z alphabet: short enough to type from a printed resume; ~488 IDs
// for 1% collision risk (https://zelark.github.io/nano-id-cc/), so callers
// validate uniqueness.
const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ', 5)

/**
 * Generate a resume ID without a uniqueness check
 *
 * For temporary display IDs in the admin dashboard only; may collide.
 */
export const UNSAFE_generateResumeId = () => {
  return nanoid()
}

/**
 * Generate a resume ID that is unique in the database
 *
 * Retries until `ResumeDocuments` has no doc with that slug.
 */
export const generateResumeId = async () => {
  'use server'

  const nextId = nanoid()

  const totalDocs = await countCollection(CollectionSlug.ResumeDocuments, {
    slug: {
      equals: nextId,
    },
  })

  return totalDocs === 0 ? nextId : generateResumeId()
}
