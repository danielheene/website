'use client'

import type React from 'react'
import { useRouter } from 'next/navigation'
import { RefreshRouteOnSave as PayloadLivePreview } from '@payloadcms/live-preview-react'

export const LivePreviewListener: React.FC = () => {
  const router = useRouter()

  return <PayloadLivePreview refresh={() => router.refresh()} serverURL={process.env.SERVER_URL} />
}
