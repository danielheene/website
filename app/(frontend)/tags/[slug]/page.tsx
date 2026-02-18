import { CollectionSlug } from '@custom-types'
import configPromise from '@payload-config'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import { cache } from 'react'

import { Headline } from '@/components/Headline'
import { PageContainer } from '@/components/PageContainer'
import RichText from '@/components/RichText'
import { generateMeta } from '@/utilities/generateMeta'
import { generateBreadcrumbList, generateCollectionPage, JsonLd } from '@/utilities/jsonLd'

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
  const tag = await queryTagBySlug({ slug })
  const { title, content } = tag

  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://danielheene.de'
  const tagUrl = `${baseUrl}/tags/${slug}`

  // Generate CollectionPage schema
  const collectionPageSchema = generateCollectionPage({
    name: title,
    url: tagUrl,
  })

  // Generate BreadcrumbList schema
  const breadcrumbSchema = generateBreadcrumbList([
    { name: 'Home', url: baseUrl },
    { name: 'Tags', url: `${baseUrl}/tags` },
    { name: title },
  ])

  return (
    <PageContainer>
      <JsonLd data={[collectionPageSchema, breadcrumbSchema]} />
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
