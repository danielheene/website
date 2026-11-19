import type { BlockAnchors } from '@/lib/extractHeadings'
import { fetchResumeCustomersCached } from '@/lib/fetchers/fetchResumeCustomers'
import type { ResumeCustomersBlock } from '@/types/payload'

import { ResumeCustomersBlockClientRenderer } from './Renderer.client'

export const ResumeCustomersBlockRenderer = async ({
  anchorId,
  title,
  blockType,
  caption,
}: ResumeCustomersBlock & BlockAnchors) => {
  const logos = await fetchResumeCustomersCached()

  return (
    <ResumeCustomersBlockClientRenderer
      anchorId={anchorId}
      title={title}
      caption={caption}
      logos={logos}
      blockType={blockType}
    />
  )
}
