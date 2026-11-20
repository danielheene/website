import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, PayloadRequest } from 'payload'

import { extractErrorMessage } from '@/lib/extractErrorMessage'
import { LATEST_RESUME_PATH } from '@/lib/routeIndex/buildRouteIndex'
import { documentPath } from '@/lib/routeIndex/paths'
import { addRoute, removeRoute } from '@/lib/routeIndex/routeIndexStore'
import { CollectionSlug } from '@/types/collections'
import { QueueSlug, TaskSlug } from '@/types/jobs-queue'

type RoutedCollection =
  | CollectionSlug['Pages']
  | CollectionSlug['BlogTopics']
  | CollectionSlug['BlogPosts']
  | CollectionSlug['ResumeDocuments']

type RoutedDoc = {
  id: number | string
  slug?: string | null
  _status?: 'draft' | 'published' | null
}

const hasDrafts = (collection: RoutedCollection) => collection !== CollectionSlug.ResumeDocuments

/**
 * The document as visitors see it. A draft save hands the hook the draft, so
 * its `_status` says nothing about the live version; this reads that instead.
 * Trashed documents are not found.
 */
const findLiveDoc = async (
  collection: RoutedCollection,
  id: RoutedDoc['id'],
  req: PayloadRequest,
): Promise<RoutedDoc | undefined> => {
  const {
    docs: [live],
  } = await req.payload.find({
    collection,
    where: {
      id: {
        equals: id,
      },
    },
    draft: false,
    depth: 0,
    limit: 1,
    pagination: false,
    overrideAccess: true,
    req,
  })

  // SAFETY: all four routed collections have `id` and `slug`; the drafted ones `_status`.
  return live as RoutedDoc | undefined
}

const queueRebuild = (req: PayloadRequest) =>
  req.payload.jobs.queue({
    task: TaskSlug.BuildRouteIndex,
    input: {},
    queue: QueueSlug.HookHandler,
  })

/**
 * Keeps the route index current as documents change. The save itself adds or
 * removes the document's path, so a new page is reachable and a deleted one
 * 404s at once; the queued full build then corrects what a single save can't
 * know (renamed slugs, topic indexability, `lastModified`). Never fails the
 * save: the next build repairs whatever an edit missed.
 */
export const routeIndexHooks = (collection: RoutedCollection) => {
  const afterChange: CollectionAfterChangeHook = async ({ doc, req }) => {
    try {
      const live = await findLiveDoc(collection, doc.id, req)
      const isLive = live?.slug && (!hasDrafts(collection) || live._status === 'published')

      if (isLive) {
        await addRoute(documentPath(collection, live.slug), { indexable: true })

        if (collection === CollectionSlug.ResumeDocuments)
          await addRoute(LATEST_RESUME_PATH, { indexable: true })
      } else if (doc.slug) {
        await removeRoute(documentPath(collection, doc.slug))
      }

      await queueRebuild(req)
    } catch (error) {
      req.payload.logger.error(`Failed to update the route index: ${extractErrorMessage(error)}`)
    }

    return doc
  }

  const afterDelete: CollectionAfterDeleteHook = async ({ doc, req }) => {
    try {
      if (doc.slug) await removeRoute(documentPath(collection, doc.slug))

      await queueRebuild(req)
    } catch (error) {
      req.payload.logger.error(`Failed to update the route index: ${extractErrorMessage(error)}`)
    }

    return doc
  }

  return {
    afterChange,
    afterDelete,
  }
}
