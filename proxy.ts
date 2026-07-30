import { NextRequest, NextResponse } from 'next/server'

import { fetchLatestResumeDocumentCore } from '@/lib/fetchers/fetchLatestResumeDocumentCore'
import { generateAPIPath } from '@/lib/generateAPIPath'
import { generateContentPath } from '@/lib/generateContentPath'
import { CollectionSlug } from '@/types/collections'

export default async function proxy(request: NextRequest) {
  const resumeDocumentLatestContentPath = generateContentPath(
    CollectionSlug.ResumeDocuments,
    'latest',
  )
  const resumeDocumentLatestAPIPath = generateAPIPath(CollectionSlug.ResumeDocuments, 'latest')

  if (request.nextUrl.pathname.startsWith(resumeDocumentLatestContentPath)) {
    const { slug } = await fetchLatestResumeDocumentCore()
    const path = generateContentPath(CollectionSlug.ResumeDocuments, slug)
    return NextResponse.rewrite(new URL(path, request.url))
  }
  if (request.nextUrl.pathname.startsWith(resumeDocumentLatestAPIPath)) {
    const { id } = await fetchLatestResumeDocumentCore()
    const path = generateAPIPath(CollectionSlug.ResumeDocuments, id)
    return NextResponse.rewrite(new URL(path, request.url))
  }

  return NextResponse.next()
}
