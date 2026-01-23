'use client'

import { Button, useDocumentInfo } from '@payloadcms/ui'
import { usePathname } from 'next/navigation.js'
import { DocumentTabClientProps } from 'payload'
import React from 'react'

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
