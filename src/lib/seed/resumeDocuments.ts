import type { Payload } from 'payload'

import { CollectionSlug } from '@/types/collections'

import type { SeedProgress } from './topics'

const SEED_PREFIX = 'seeded-dummy'

const DAY_MS = 24 * 60 * 60 * 1000

/**
 * Two documents 30 days apart, so both `/resume/latest` and a superseded
 * `/resume/<slug>` (with its "newer version" banner) have something to
 * render. No PDFs or thumbnails: the page renders without them.
 */
export const SEEDED_RESUME_DOCUMENTS = [
  {
    slug: `${SEED_PREFIX}-resume-older`,
    title: 'Seeded Resume (older)',
    ageInDays: 30,
  },
  {
    slug: `${SEED_PREFIX}-resume-newer`,
    title: 'Seeded Resume (newer)',
    ageInDays: 0,
  },
] as const

/**
 * Creates the fixture ResumeDocuments, tagged `generatorFlags:
 * ['seeded-dummy']`. Idempotent by slug. The collection forbids `create`
 * through the API; the Local API bypasses access.
 */
export const seedResumeDocuments = async (
  payload: Payload,
  onProgress?: (progress: SeedProgress) => void,
  now: Date = new Date(),
): Promise<{
  created: number
}> => {
  let created = 0
  const total = SEEDED_RESUME_DOCUMENTS.length

  for (const [index, { slug, title, ageInDays }] of SEEDED_RESUME_DOCUMENTS.entries()) {
    onProgress?.({
      step: `Checking ${slug}`,
      current: index + 1,
      total,
    })

    const { docs: existing } = await payload.find({
      collection: CollectionSlug.ResumeDocuments,
      where: {
        slug: {
          equals: slug,
        },
      },
      limit: 1,
      pagination: false,
    })

    if (existing.length > 0) {
      continue
    }

    onProgress?.({
      step: `Creating ${slug}`,
      current: index + 1,
      total,
    })

    await payload.create({
      collection: CollectionSlug.ResumeDocuments,
      data: {
        title,
        slug,
        createdAt: new Date(now.getTime() - ageInDays * DAY_MS).toISOString(),
        generatorFlags: ['seeded-dummy'],
      },
    })

    created += 1
  }

  return {
    created,
  }
}

/** Deletes every seeded-dummy ResumeDocuments document. */
export const cleanResumeDocuments = async (
  payload: Payload,
  onProgress?: (progress: SeedProgress) => void,
): Promise<{
  deleted: number
}> => {
  const { docs } = await payload.find({
    collection: CollectionSlug.ResumeDocuments,
    where: {
      generatorFlags: {
        in: ['seeded-dummy'],
      },
    },
    limit: 0,
    pagination: false,
  })

  for (const [index, doc] of docs.entries()) {
    onProgress?.({
      step: `Deleting ${doc.slug}`,
      current: index + 1,
      total: docs.length,
    })

    await payload.delete({
      collection: CollectionSlug.ResumeDocuments,
      id: doc.id,
    })
  }

  return {
    deleted: docs.length,
  }
}
