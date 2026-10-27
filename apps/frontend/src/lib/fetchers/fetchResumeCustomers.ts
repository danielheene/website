import { cacheLife, cacheTag, revalidateTag } from 'next/cache'

import { BilingualLanguage, reduceDataToBilingualLanguage } from '@website/lib/i18n'
import { sanitizeSvg } from '@website/lib/sanitizeSvg'
import { CollectionSlug } from '@website/types/collections'
import type { ResumeCustomerData } from '@website/types/payload'

import { fetchCollection } from '@/lib/payloadClient'
import { resolveRelations } from '@/lib/resolveRelation'

export const fetchResumeCustomers = async (locale: BilingualLanguage = 'en') => {
  const docs = await fetchCollection<ResumeCustomerData>(CollectionSlug.ResumeCustomers, {
    cacheTag: CollectionSlug.ResumeCustomers,
    joins: false,
    where: {
      _status: {
        equals: 'published',
      },
    },
    limit: 0,
    pagination: false,
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
