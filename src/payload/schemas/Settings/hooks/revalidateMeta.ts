import type { GlobalAfterChangeHook } from 'payload'

import { revalidateTag } from 'next/cache'
import { snakeCase } from 'lodash-es'
import { SLUG } from '../_shared'

export const revalidateMeta: GlobalAfterChangeHook = ({
  doc,
  req: { payload },
  context: { isSeedContext },
}) => {
  if (doc._status !== 'published') return
  if (!isSeedContext) payload.logger.info(`Revalidating Meta Settings`)

  revalidateTag(snakeCase(SLUG.META))
}
