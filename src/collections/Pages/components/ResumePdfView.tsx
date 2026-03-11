'use server'

import type { AdminViewServerProps } from 'payload'

import ResumePdfViewClientComponent from '@/collections/Pages/components/ResumePdfView.client'
import { getCachedResumeDocumentData } from '@/lib/getResumeDocumentData'
import { CollectionSlug } from '@custom-types'

export default async function ResumePdfViewComponent({
                                                       initPageResult,
                                                       locale,
                                                       user,
                                                     }: AdminViewServerProps) {


  if (!user) return null


  const data = await initPageResult.req.payload.findByID({
    collection: CollectionSlug.Pages,
    id: initPageResult.docID,
  })

  if (!data) return null
  if (!('layout' in data) || ('layout' in data && data.layout !== 'resume')) return null

  const documentData = await getCachedResumeDocumentData(locale.code === 'de' ? 'de' : 'en')

  return <ResumePdfViewClientComponent {...documentData} />
}
