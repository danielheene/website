import type { Payload } from 'payload'

import { extractErrorMessage } from '@/lib/extractErrorMessage'
import { generateSlug } from '@/lib/generateSlug'
import { paragraph, root } from '@/lib/seed/lexical'
import { CollectionSlug } from '@/types/collections'
import type { Topic } from '@/types/payload'

export type SeedProgress = {
  step: string
  current: number
  total: number
}

const SEED_PREFIX = 'seeded-dummy'

const TOPICS = [
  {
    title: 'TypeScript',
    featured: true,
  },
  {
    title: 'Next.js',
    featured: true,
  },
  {
    title: 'Payload CMS',
    featured: true,
  },
  {
    title: 'DevOps',
    featured: false,
  },
  {
    title: 'Design Systems',
    featured: false,
  },
  {
    title: 'Testing',
    featured: true,
  },
] as const

const topicFor = (
  index: number,
): {
  title: string
  featured: boolean
} => {
  const base = TOPICS[(index - 1) % TOPICS.length]
  const cycle = Math.floor((index - 1) / TOPICS.length)
  return cycle === 0
    ? base
    : {
        title: `${base.title} ${cycle + 1}`,
        featured: base.featured,
      }
}

/**
 * Creates `count` fixture BlogTopics, tagged `generatorFlags:
 * ['seeded-dummy']`. Idempotent by slug (`seeded-dummy-topic-<slug>`), same
 * convention as `seedPages`. No hero image — `seed-blog.ts` never set one
 * and the field isn't required, and this matches that.
 */
export const seedTopics = async (
  payload: Payload,
  count: number,
  onProgress?: (progress: SeedProgress) => void,
): Promise<{
  created: number
}> => {
  let created = 0

  for (let index = 1; index <= count; index += 1) {
    const { title, featured } = topicFor(index)
    const slug = `${SEED_PREFIX}-topic-${generateSlug(title)}`

    onProgress?.({
      step: `Checking ${slug}`,
      current: index,
      total: count,
    })

    const { docs: existing } = await payload.find({
      collection: CollectionSlug.BlogTopics,
      where: {
        slug: {
          equals: slug,
        },
      },
      limit: 1,
      pagination: false,
      trash: true,
    })

    if (existing.length > 0) {
      continue
    }

    onProgress?.({
      step: `Creating ${slug}`,
      current: index,
      total: count,
    })

    await payload.create({
      collection: CollectionSlug.BlogTopics,
      context: {
        skipRevalidate: true,
      },
      data: {
        title,
        slug,
        featured,
        generatorFlags: [
          'seeded-dummy',
        ],
        content: root([
          paragraph(`Posts about ${title}.`),
        ]) as unknown as Topic['content'],
      },
    })

    created += 1
  }

  return {
    created,
  }
}

/**
 * Deletes every seeded-dummy BlogTopics document, EXCEPT one a non-seeded
 * (real) post still references — deleting a topic still in use would break
 * that post's topic relationship for no reason related to seed cleanup.
 * Counts such topics in `skipped` rather than `deleted` so callers can
 * report them rather than silently no-op.
 */
export const cleanTopics = async (
  payload: Payload,
  onProgress?: (progress: SeedProgress) => void,
): Promise<{
  deleted: number
  skipped: number
}> => {
  const { docs: topics } = await payload.find({
    collection: CollectionSlug.BlogTopics,
    where: {
      generatorFlags: {
        in: [
          'seeded-dummy',
        ],
      },
    },
    limit: 0,
    pagination: false,
    trash: true,
  })

  let deleted = 0
  let skipped = 0

  for (const [index, topic] of topics.entries()) {
    onProgress?.({
      step: `Checking references to ${topic.slug}`,
      current: index + 1,
      total: topics.length,
    })

    // `topics` is stored as `{ relationTo, value }` wrapper objects (see
    // BlogPosts' field config) even though it only ever targets one
    // collection, so the match has to reach into `.value` rather than
    // `contains` against the bare id.
    const { totalDocs: referencedByPosts } = await payload.find({
      collection: CollectionSlug.BlogPosts,
      where: {
        'topics.value': {
          equals: topic.id,
        },
        generatorFlags: {
          not_in: [
            'seeded-dummy',
          ],
        },
      },
      limit: 0,
      pagination: false,
    })

    if (referencedByPosts > 0) {
      skipped += 1
      continue
    }

    onProgress?.({
      step: `Deleting ${topic.slug}`,
      current: index + 1,
      total: topics.length,
    })

    try {
      await payload.delete({
        collection: CollectionSlug.BlogTopics,
        id: topic.id,
        context: {
          skipRevalidate: true,
        },
        trash: true,
      })
      deleted += 1
    } catch (error) {
      // Backstop for the pre-check above: a reference created between the
      // check and the delete (or one the query shape doesn't anticipate)
      // must not abort the rest of the cleanup.
      skipped += 1
      console.warn(`skipped deleting topic "${topic.slug}":`, extractErrorMessage(error))
    }
  }

  return {
    deleted,
    skipped,
  }
}
