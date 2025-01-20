import type { GlobalAfterChangeHook } from 'payload'

import { revalidateTag } from 'next/cache'
import { snakeCase } from 'lodash-es'
import { SLUG } from '../_shared'

export const revalidateAboutMe: GlobalAfterChangeHook = ({
  doc,
  req: { payload },
  context: { isSeedContext },
}) => {
  if (doc._status !== 'published') return
  if (!isSeedContext) payload.logger.info(`Revalidating AboutMe Section`)

  revalidateTag(snakeCase(SLUG.ABOUT_ME))
}
