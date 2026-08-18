import { cacheLife, cacheTag, revalidateTag } from 'next/cache'
import config from '@payload-config'
import { getPayload } from 'payload'

import { BilingualLanguage, reduceDataToBilingualLanguage } from '@/lib/i18n'
import { resolveRelations } from '@/lib/resolveRelation'
import { sanitizeSvg } from '@/lib/sanitizeSvg'
import { CollectionSlug } from '@/types/collections'

export const fetchResumeCustomers = async (locale: BilingualLanguage = 'en') => {
  const payload = await getPayload({
    config,
  })

  const { docs = [] } = await payload.find({
    collection: CollectionSlug.ResumeCustomers,
    draft: false,
    pagination: false,
    limit: 0,
  })

  const resolved = await resolveRelations(reduceDataToBilingualLanguage(docs, locale))

  /**
   * Sanitized on read as well as on write: rows saved before the
   * `ResumeCustomers` `beforeChange` hook existed still hold whatever was
   * stored then, and `LogoCarousel` renders this with
   * `dangerouslySetInnerHTML`. Done here — inside the caller's `use cache`
   * boundary — because DOMPurify's JSDOM backing reads the current time, which
   * a bare prerender is not allowed to observe.
   */
  return resolved.map((customer) => ({
    ...customer,
    svg: typeof customer.svg === 'string' ? sanitizeSvg(customer.svg) : customer.svg,
  }))
}

export const fetchResumeCustomersCached = async (locale: BilingualLanguage = 'en') => {
  'use cache'
  cacheLife('max')
  cacheTag(CollectionSlug.ResumeCustomers)
  return await fetchResumeCustomers(locale)
}

export const revalidateResumeCustomers = async (): Promise<void> => {
  revalidateTag(CollectionSlug.ResumeCustomers, 'max')
}
