import type { CollectionAfterChangeHook } from 'payload'

import { revalidatePath } from 'next/cache'

import type { BlogCategory } from '@payload-types'

export const revalidateCategory: CollectionAfterChangeHook<BlogCategory> = ({
  doc,
  req: { payload },
}) => {
  const path = `/category/${doc.slug}`
  payload.logger.info(`Revalidating page at path: ${path}`)

  revalidatePath(path)

  return doc
}
