import { cache } from 'react'
import type { Metadata } from 'next'
import { cacheLife, cacheTag } from 'next/cache'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { connection } from 'next/server'
import config from '@payload-config'
import { getPayload } from 'payload'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { Headline } from '@/components/Headline'
import { HeroMedia } from '@/components/HeroMedia'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { PageContainer } from '@/components/PageContainer'
import { extractSections } from '@/lib/extractSections'
import { generateMeta } from '@/lib/generateMeta'
import { placeholderParams } from '@/lib/placeholderParams'
import { CollectionData, CollectionSlug } from '@/types/collections'

export async function generateStaticParams() {
  const payload = await getPayload({
    config,
  })
  const { docs = [] } = await payload.find({
    collection: CollectionSlug.Pages,
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    where: {
      slug: {
        not_equals: 'home',
      },
    },
    select: {
      slug: true,
    },
  })

  if (docs.length === 0) {
    return placeholderParams('/[slug]')
  }

  return docs.map(({ slug }) => ({
    slug,
  }))
}

type PageProps = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Page({ params }: PageProps) {
  const { isEnabled: draft } = await draftMode()
  const { slug = 'home' } = await params

  const page: CollectionData<CollectionSlug['Pages']> = await queryPageBySlug(slug)
  if (!page) notFound()

  const { title, layout, hero, content } = page
  return (
    <PageContainer layout={layout} sections={extractSections(content)}>
      <HeroMedia
        className="border-b-2 border-b-primary"
        fallbackAlt={title || 'Hero Image'}
        background={hero?.background}
      >
        {title && (
          <div className="pt-40 pb-20">
            <div className="container">
              <Headline
                variant="page-title"
                className="text-balance text-foreground textshadow-lg shadow-primary/75"
              >
                {title}
              </Headline>
            </div>
          </div>
        )}
      </HeroMedia>
      <div className="container">
        <RenderBlocks blocks={content} />
      </div>

      {draft && <LivePreviewListener />}
    </PageContainer>
  )
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug = 'home' } = await params
  const doc = await queryPageBySlug(slug)
  return generateMeta({
    doc,
  })
}

const queryPublishedPageBySlug = async (slug: string) => {
  'use cache'
  cacheLife('max')
  cacheTag(CollectionSlug.Pages)

  const payload = await getPayload({
    config,
  })

  const { docs = [] } = await payload.find({
    collection: CollectionSlug.Pages,
    draft: false,
    limit: 1,
    pagination: false,
    overrideAccess: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return (docs[0] as CollectionData<CollectionSlug['Pages']>) || null
}

const queryDraftPageBySlug = async (slug: string) => {
  // Draft reads are request-scoped and uncached: Payload's `find()` reads the
  // current time internally, which a static prerender is not allowed to observe.
  // `connection()` marks this branch dynamic so the time access happens after
  // Request data has been read.
  await connection()

  const payload = await getPayload({
    config,
  })

  const { docs = [] } = await payload.find({
    collection: CollectionSlug.Pages,
    draft: true,
    limit: 1,
    pagination: false,
    overrideAccess: true,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return (docs[0] as CollectionData<CollectionSlug['Pages']>) || null
}

export const queryPageBySlug = cache(async (slug: string) => {
  const { isEnabled: draft } = await draftMode()
  return draft ? queryDraftPageBySlug(slug) : queryPublishedPageBySlug(slug)
})
