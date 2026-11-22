import type { BlockAnchors } from '@/lib/extractHeadings'
import { fetchGlobalUserSettingsCached } from '@/lib/fetchers'
import { ResumeContactBlock } from '@/types/payload'

import { ResumeContactBlockClientRenderer } from './Renderer.client'

export const ResumeContactBlockRenderer = async ({
  anchorId,
  title,
  blockType,
  caption,
}: ResumeContactBlock & BlockAnchors) => {
  const { email, phoneNumber } = await fetchGlobalUserSettingsCached()

  return (
    <ResumeContactBlockClientRenderer
      anchorId={anchorId}
      blockType={blockType}
      title={title}
      caption={caption}
      email={email}
      phoneNumber={phoneNumber}
    />
  )
}
