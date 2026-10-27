'use server'

import type { ResumeCustomersBlock } from '@website/types/payload'

import { fetchResumeCustomersCached } from '@/lib/fetchers/fetchResumeCustomers'

import { ResumeCustomersBlockClientRenderer } from './Renderer.client'

export const ResumeCustomersBlockRenderer = async ({
  title,
  blockType,
  caption,
}: ResumeCustomersBlock) => {
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
