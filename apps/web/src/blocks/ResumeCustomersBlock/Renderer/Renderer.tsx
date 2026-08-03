'use server'

import { Suspense } from 'react'

import { fetchResumeCustomersCached } from '@/lib/fetchers/fetchResumeCustomers'
import type { ResumeCustomersBlock } from '@/types/payload'

import { ResumeCustomersBlockClientRenderer } from './Renderer.client'

export const ResumeCustomersBlockRenderer = async ({
  blockType,
  caption,
}: ResumeCustomersBlock) => {
  const title = 'Customers'

  const logos = await fetchResumeCustomersCached()

  return (
    <ResumeCustomersBlockClientRenderer
      title={title}
      caption={caption}
      logos={logos}
      blockType={blockType}
    />
  )
}
