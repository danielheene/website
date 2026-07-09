import config from '@payload-config'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import { cache } from 'react'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { Headline } from '@/components/Headline'
import { ImageMedia } from '@/components/ImageMedia'
import { PageContainer } from '@/components/PageContainer'
import { generateMeta } from '@/lib/generateMeta'
import { isMediaImage } from '@/lib/typeGuards'
import { CollectionSlug, CollectionData } from '@/types/collections'
import type { Page as PageType } from '@/types/payload'

export async function generateStaticParams() {
  const payload = await getPayload({
    config,
  })
  const { docs = [] } = await payload.find({
    collection: CollectionSlug['Pages'],
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

export default async function Page({ params: paramsPromise }: PageProps) {
  const { slug = 'home' } = await paramsPromise

  const page: CollectionData<CollectionSlug['Pages']> = await queryPageBySlug({
    slug,
  })
  if (!page) notFound()

  const { title, layout, hero, content } = page
  return (
    <PageContainer layout={layout}>
      <div className="relative pt-32 h-screen">
        {/*{isHeroMediaArray(hero.media) && hero.media.map()}*/}
        {hero?.media &&
          Array.isArray(hero.media) &&
          isMediaImage(hero.media[0]) && (
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
            className="relative z-10 mt-28 mb-32 text-white textshadow-lg shadow-primary/75"
          >
            {title}
          </Headline>
        )}
      </div>
      <RenderBlocks blocks={content} />

      {/*{draft && <RefreshRouteOnSave />}*/}
    </PageContainer>
  )
}

export async function generateMetadata({
  params: paramsPromise,
}: PageProps): Promise<Metadata> {
  const { slug = 'home' } = await paramsPromise
  const doc = await queryPageBySlug({
    slug,
  })
  return generateMeta({
    doc,
  })
}

const queryPageBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({
    config,
  })

  const { docs = [] } = await payload.find({
    collection: CollectionSlug['Pages'],
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
