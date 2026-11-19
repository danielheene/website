import { cacheLife, cacheTag } from 'next/cache'

import { shuffle } from 'lodash-es'

import { customerLogoPath } from '@/collections/ResumeCustomers/logoPath'
import type { BlockAnchors } from '@/lib/extractHeadings'
import { fetchResumeCustomersCached } from '@/lib/fetchers/fetchResumeCustomers'
import { CollectionSlug } from '@/types/collections'
import type { ResumeCustomersBlock } from '@/types/payload'

import { type CustomerLogo, ResumeCustomersBlockClientRenderer } from './Renderer.client'

const MARQUEE_ROWS = 5

/**
 * Every marquee row holds all logos in its own random order. Shuffled inside
 * the cache so server and client render the same rows; a new order comes with
 * the next change to the customers.
 */
const shuffleIntoRows = async (logos: CustomerLogo[]) => {
  'use cache'
  cacheLife('max')
  cacheTag(CollectionSlug.ResumeCustomers)

  return Array.from(
    {
      length: MARQUEE_ROWS,
    },
    () => shuffle(logos),
  )
}

export const ResumeCustomersBlockRenderer = async ({
  anchorId,
  title,
  blockType,
  caption,
}: ResumeCustomersBlock & BlockAnchors) => {
  const customers = await fetchResumeCustomersCached()

  const logos = customers
    .filter(({ slug, updatedAt }) => slug && updatedAt)
    .map(({ id, slug, title: customer, updatedAt }) => ({
      id,
      title: customer,
      src: customerLogoPath({
        slug,
        updatedAt,
      }),
    }))

  const rows = await shuffleIntoRows(logos)

  return (
    <ResumeCustomersBlockClientRenderer
      anchorId={anchorId}
      title={title}
      caption={caption}
      logos={logos}
      rows={rows}
      blockType={blockType}
    />
  )
}
