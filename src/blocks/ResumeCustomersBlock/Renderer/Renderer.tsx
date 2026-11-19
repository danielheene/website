import { cacheLife, cacheTag } from 'next/cache'

import { shuffle } from 'lodash-es'

import type { LogoCarouselProps } from '@/components/LogoCarousel/LogoCarousel'
import type { BlockAnchors } from '@/lib/extractHeadings'
import { fetchResumeCustomersCached } from '@/lib/fetchers/fetchResumeCustomers'
import { CollectionSlug } from '@/types/collections'
import type { ResumeCustomersBlock } from '@/types/payload'

import { ResumeCustomersBlockClientRenderer } from './Renderer.client'

const MARQUEE_ROWS = 5

/**
 * Every marquee row holds all logos in its own random order. Shuffled inside
 * the cache so server and client render the same rows; a new order comes with
 * the next change to the customers.
 */
const shuffleIntoRows = async (logos: LogoCarouselProps['entries']) => {
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
  const logos = await fetchResumeCustomersCached()

  const rows = await shuffleIntoRows(
    logos.map(({ id, svg, title: customer }) => ({
      id,
      svg,
      title: customer,
    })),
  )

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
