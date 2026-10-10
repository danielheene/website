import config from '@payload-config'
import { getPayload } from 'payload'

import { customAlphabet } from 'nanoid'

import { CollectionSlug } from '@/types/collections'

/**
 * Generate a unique ID for a resume document
 *
 * According to the [Nano ID Collision Calculator](https://zelark.github.io/nano-id-cc/), there are
 * 488 IDs needed to have a 1% probability of at least one collision. In favor of readability, a shorter
 * ID is preferred due to making it easier to access the online version of the resume if someone only
 * has access to a printed document. To avoid collisions, the ID is validated against the database and
 * checked for uniqueness.
 */
const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ', 5)

/**
 * Generate a unique ID for a resume document without validation against the database
 *
 * This function generates a unique ID for a resume document without validating it against the database,
 * which is useful for generating a temporary ID visual representations in the admin dashboard.
 */
export const UNSAFE_generateResumeId = () => {
  return nanoid()
}

/**
 * Generate a unique ID for a resume document
 *
 * This function generates a unique ID for a resume document, which is validated against the database
 * and checked for uniqueness. It is useful for generating a unique ID for a resume document.
 */
export const generateResumeId = async () => {
  'use server'

  const payload = await getPayload({
    config,
  })

  const nextId = nanoid()

  const { totalDocs } = await payload.count({
    collection: CollectionSlug.ResumeDocuments,
    where: {
      slug: {
        equals: nextId,
      },
    },
  })

  return totalDocs === 0 ? nextId : generateResumeId()
}
