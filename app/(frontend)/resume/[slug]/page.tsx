import { Suspense } from 'react'
import type { Metadata } from 'next'
import { cacheLife, cacheTag } from 'next/cache'
import config from '@payload-config'
import { getPayload } from 'payload'

import { ResumeChecksumValidator } from '@/components/ResumeCheckumValidatior/ResumeChecksumValidator'
import { cn } from '@/lib/cn'
import { placeholderParams } from '@/lib/placeholderParams'
import { CollectionData, CollectionSlug } from '@/types/collections'

export default async function ResumeDocumentPage({ params }: PageProps<'/resume/[slug]'>) {
  const { slug } = await params

  const resume = await queryResumeDocumentBySlug(slug)

  return (
    <div>
      <section
        className={cn([
          'min-w-screen aspect-21-9 relative overflow-hidden',
          'bg-linear-to-bl from-purple-500 via-indigo-500 to-primary-600',
        ])}
      >
        <div
          className={cn([
            'w-0 h-0 absolute left-[85%] bottom-[-10%] rotate-[-195deg]',
          ])}
        >
          <div
            className={cn([
              'aspect-210/297 w-[50vw] absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
              'bg-white',
            ])}
          ></div>
        </div>
      </section>
      <h1>{slug}</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <ResumeChecksumValidator />
      </Suspense>
    </div>
  )
}

export async function generateStaticParams() {
  const payload = await getPayload({
    config,
  })

  const { docs = [] } = await payload.find({
    collection: CollectionSlug.ResumeDocuments,
    draft: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  if (docs.length === 0) {
    return placeholderParams('/resume/[slug]')
  }

  return docs.map(({ slug }) => ({
    slug,
  }))
}

export async function generateMetadata({ params }: PageProps<'/resume/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  const resume = await queryResumeDocumentBySlug(slug)

  return {
    title: resume?.title ?? 'Resume',
  }
}

export const queryResumeDocumentBySlug = async (slug: string) => {
  'use cache'
  cacheLife('max')
  cacheTag(CollectionSlug.ResumeDocuments)

  const payload = await getPayload({
    config,
  })

  const { docs = [] } = await payload.find({
    collection: CollectionSlug.ResumeDocuments,
    draft: false,
    limit: 1,
    pagination: false,
    // overrideAccess: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return (docs[0] as CollectionData<CollectionSlug['ResumeDocuments']>) || null
}
