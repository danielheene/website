import { GlobalSlug } from '@custom-types'
import { snakeCase } from 'lodash-es'

import { revalidateTag } from 'next/cache'
import type { GlobalAfterChangeHook } from 'payload'

export const revalidateMeta: GlobalAfterChangeHook = ({ doc, req: { payload }, context: { isSeedContext } }) => {
  if (doc._status !== 'published') return
  if (!isSeedContext) payload.logger.info(`Revalidating Meta Settings`)

  revalidateTag(snakeCase(GlobalSlug.SettingsMeta))
}
