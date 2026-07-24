import { cache } from 'react'
import type { Metadata } from 'next'
import { draftMode, headers } from 'next/headers'
import { notFound } from 'next/navigation'
import config from '@payload-config'
import { getPayload } from 'payload'
import { RefreshRouteOnSave } from '@payloadcms/live-preview-react'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { Headline } from '@/components/Headline'
import { ImageMedia } from '@/components/ImageMedia'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { PageContainer } from '@/components/PageContainer'
import { generateMeta } from '@/lib/generateMeta'
import { isMediaImage } from '@/lib/typeGuards'
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
    <PageContainer layout={layout}>
      <div className="relative pt-32 h-screen">
        {/*{isHeroMediaArray(hero.media) && hero.media.map()}*/}
        {hero?.media && Array.isArray(hero.media) && isMediaImage(hero.media[0]) && (
          <ImageMedia
            url={hero.media[0].url}
            className="absolute top-0 left-0 right-0 bottom-0 border-b-2 border-b-primary"
            alt={hero.media[0].alt || title || 'Hero Image'}
            width={hero.media[0].width}
            height={hero.media[0].height}
            sizes="100vw"
            blurDataURL={hero.media[0].blurDataURL}
            priority
            fill
          />
        )}
        {title && (
          <Headline
            variant="page-title"
            className="relative z-10 mt-28 mb-32 text-foreground textshadow-lg shadow-primary/75"
          >
            {title}
          </Headline>
        )}
      </div>
      <RenderBlocks blocks={content} />

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

const queryPageBySlug = cache(async (slug: string) => {
  await headers()
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({
    config,
  })

  const { docs = [] } = await payload.find({
    collection: CollectionSlug.Pages,
    draft,
    limit: 1,
    pagination: false,
    overrideAccess: draft,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return (docs[0] as CollectionData<CollectionSlug['Pages']>) || null
})
