import type { CollectionAfterChangeHook } from 'payload'

import { revalidatePath } from 'next/cache'

import type { BlogTag } from '@payload-types'

export const revalidateTag: CollectionAfterChangeHook<BlogTag> = ({ doc, req: { payload } }) => {
  const path = `/tag/${doc.slug}`
  payload.logger.info(`Revalidating page at path: ${path}`)

  revalidatePath(path)

  return doc
}
