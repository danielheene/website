import type { GlobalAfterChangeHook } from 'payload'

import { revalidateTag } from 'next/cache'
import { snakeCase } from 'lodash-es'
import { SLUG } from '../_shared'

export const revalidateHero: GlobalAfterChangeHook = ({
  doc,
  req: { payload },
  context: { isSeedContext },
}) => {
  if (doc._status !== 'published') return
  if (!isSeedContext) payload.logger.info(`Revalidating Hero Section`)

  revalidateTag(snakeCase(SLUG.HERO))
}
