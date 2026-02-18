'use client'

import { Button, useDocumentInfo } from '@payloadcms/ui'
import { usePathname } from 'next/navigation.js'
import type { DocumentTabClientProps } from 'payload'

export default function ResumePdfTabComponent({ path }: DocumentTabClientProps) {
  const { collectionSlug, data } = useDocumentInfo()
  const pathname = usePathname()

  const urlPath = `/admin/collections/${collectionSlug}/${data.id}${path}`
  const isDisabled = pathname === urlPath

  return data.slug === 'resume' ? (
    <Button url={urlPath} disabled={isDisabled} buttonStyle="tab" el="link">
      PDF
    </Button>
  ) : null
}
