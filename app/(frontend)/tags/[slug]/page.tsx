import { Headline } from '@/components/Headline'
import { PageContainer } from '@/components/PageContainer'
import RichText from '@/components/RichText'
import { generateMeta } from '@/utilities/generateMeta'
import { CollectionSlug } from '@custom-types'

import configPromise from '@payload-config'
import { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import React, { cache } from 'react'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const { docs = [] } = await payload.find({
    collection: CollectionSlug.BlogTags,
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
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
  const { slug } = await paramsPromise
  const { title, content } = await queryTagBySlug({ slug })

  return (
    <PageContainer>
      <div className="relative pt-32 h-screen">
        <Headline variant="page-title" className="relative z-10 mt-28 mb-32 text-white textshadow-lg shadow-primary/75">
          {title}
        </Headline>
      </div>

      <RichText data={content} />
    </PageContainer>
  )
}

export async function generateMetadata({ params: paramsPromise }: PageProps): Promise<Metadata> {
  const { slug } = await paramsPromise
  const tag = await queryTagBySlug({ slug })

  return generateMeta({ doc: tag })
}

const queryTagBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  const { docs = [] } = await payload.find({
    collection: CollectionSlug.BlogTags,
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

  return docs[0] ?? null
})
