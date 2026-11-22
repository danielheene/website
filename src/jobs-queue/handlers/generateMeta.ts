import type { TaskHandler } from 'payload'

import { loadLatestDocument, latestWriteOptions } from '@/jobs-queue/lib/documentTaskHandler'
import { fetchAnthropicMetaDescription } from '@/lib/anthropic/fetchMetaDescription'
import { resolveDocumentTaskSteps } from '@/lib/documentTasks/definitions'
import { generateMetaTitle } from '@/lib/generateMetaTitle'
import { CollectionSlug } from '@/types/collections'
import { TaskSlug } from '@/types/jobs-queue'

const META_COLLECTIONS = [
  CollectionSlug.Pages,
  CollectionSlug.BlogPosts,
  CollectionSlug.BlogTopics,
] as const

type MetaCollection = (typeof META_COLLECTIONS)[number]

const isMetaCollection = (collection: string): collection is MetaCollection =>
  META_COLLECTIONS.some((slug) => slug === collection)

const run: TaskHandler<TaskSlug['GenerateMeta']> = async ({ input, req: { payload } }) => {
  const { collection, id } = input

  if (!isMetaCollection(collection)) throw new Error(`"${collection}" has no meta data`)

  const steps = resolveDocumentTaskSteps(TaskSlug.GenerateMeta, input.steps)
  const doc = await loadLatestDocument(payload, collection, id)

  if (!doc) return { output: { updated: false } }

  const title = steps.has('title') && doc.title ? await generateMetaTitle(doc.title) : null

  // a Claude outage costs only the description: the title is still saved
  const generateDescription = async () => {
    try {
      return await fetchAnthropicMetaDescription({ collection, data: doc })
    } catch (error) {
      payload.logger.error({
        err: error,
        msg: `generateMeta: description for ${collection}/${id} failed`,
      })

      return null
    }
  }

  const description = steps.has('description') ? await generateDescription() : null

  if (!title && !description) return { output: { updated: false } }

  await payload.update({
    ...latestWriteOptions(payload, TaskSlug.GenerateMeta, collection, doc),
    collection: collection,
    data: {
      meta: {
        ...doc.meta,
        ...(title && { title }),
        ...(description && { description }),
      },
    },
  })

  return { output: { updated: true } }
}

export const handler = run
