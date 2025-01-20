import type { GlobalAfterChangeHook } from 'payload'

import { revalidateTag } from 'next/cache'
import { snakeCase } from 'lodash-es'
import { SLUG } from '../_shared'

export const revalidateExperience: GlobalAfterChangeHook = ({
  doc,
  req: { payload },
  context: { isSeedContext },
}) => {
  if (doc._status !== 'published') return
  if (!isSeedContext) payload.logger.info(`Revalidating Experience Section`)

  revalidateTag(snakeCase(SLUG.EXPERIENCE))
}
