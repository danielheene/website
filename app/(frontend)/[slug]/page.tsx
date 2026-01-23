import { RenderBlocks } from '@/blocks/RenderBlocks'
import { Headline } from '@/components/Headline'
import { ImageMedia } from '@/components/ImageMedia'
import { PageContainer } from '@/components/PageContainer'
import { generateMeta } from '@/utilities/generateMeta'
import { CollectionSlug } from '@custom-types'

import config from '@payload-config'
import { Page as PageType } from '@payload-types'
import { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import React, { cache } from 'react'

export async function generateStaticParams() {
  const payload = await getPayload({ config })
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

  return docs.map(({ slug }) => ({ slug }))
}

type PageProps = {
  params: Promise<{ slug?: string }>
}

export default async function Page({ params: paramsPromise }: PageProps) {
  const { slug = 'home' } = await paramsPromise

  const page: PageType = await queryPageBySlug({ slug })
  if (!page) notFound()

  const { title, layout, hero, content } = page
  return (
    <PageContainer layout={layout}>
      <div className="relative pt-32 h-screen">
        {hero && hero.media && Array.isArray(hero.media) && typeof hero.media[0] === 'object' && (
          <ImageMedia
            url={hero.media[0].url}
            className="absolute top-0 left-0 right-0 bottom-0 border-b-2 border-b-primary"
            alt={`${title} Hero Image`}
            width={hero.media[0].width}
            height={hero.media[0].height}
            sizes="100vw"
            priority
            fill
            duoTone
          />
        )}
        <Headline variant="page-title" className="relative z-10 mt-28 mb-32 text-white textshadow-lg shadow-primary/75">
          {title}
        </Headline>
      </div>
      <RenderBlocks blocks={content} />

      {/*{draft && <RefreshRouteOnSave />}*/}
    </PageContainer>
  )
}

export async function generateMetadata({ params: paramsPromise }: PageProps): Promise<Metadata> {
  const { slug = 'home' } = await paramsPromise
  const doc = await queryPageBySlug({ slug })
  return generateMeta({ doc })
}

const queryPageBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config })

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

  return docs[0] || null
})
