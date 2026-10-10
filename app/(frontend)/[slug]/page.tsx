import { cache, Suspense } from 'react'
import type { Metadata } from 'next'
import { cacheLife, cacheTag } from 'next/cache'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { connection } from 'next/server'
import config from '@payload-config'
import { getPayload } from 'payload'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { ArticleSidebar } from '@/components/ArticleSidebar'
import { Headline } from '@/components/Headline'
import { HeroMedia } from '@/components/HeroMedia'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { PageContainer } from '@/components/PageContainer'
import { RichText } from '@/components/RichText'
import { extractHeadings } from '@/lib/extractHeadings'
import { extractSections } from '@/lib/extractSections'
import { generateMeta } from '@/lib/generateMeta'
import { isEmptyValue } from '@/lib/lexical/isEmptyValue'
import { placeholderParams } from '@/lib/placeholderParams'
import { highlightRichText } from '@/lib/shiki/highlightRichText'
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
  const [{ isEnabled: draft }, { slug = 'home' }] = await Promise.all([draftMode(), params])

  const page: CollectionData<CollectionSlug['Pages']> = await queryPageBySlug(slug)
  if (!page) notFound()

  const { title, layout, hero, content } = page

  const legalHeadings =
    layout === 'legal'
      ? (content ?? []).flatMap((block) => {
          const lexical = (block as { content?: unknown }).content
          return extractHeadings(lexical)
        })
      : []

  const useCustomHeroContent = hero?.contentType === 'custom' && !isEmptyValue(hero.content)
  const highlightedHeroCode = useCustomHeroContent
    ? await highlightRichText(hero?.content)
    : undefined

  return (
    <PageContainer layout={layout} sections={extractSections(content)}>
      <HeroMedia
        className="border-b-2 border-b-primary"
        fallbackAlt={title || 'Hero Image'}
        slides={hero?.slides}
      >
        {useCustomHeroContent ? (
          <div className="pt-40 pb-20">
            <div className="container">
              {/* RichText is a Client Component that calls randomUUID(), which
                  Cache Components requires to sit behind a Suspense boundary. */}
              <Suspense fallback={<div className="h-24 animate-pulse rounded-lg bg-muted" />}>
                <RichText
                  data={hero.content}
                  enableGutter={false}
                  highlightedCode={highlightedHeroCode}
                  className="text-balance text-foreground textshadow-lg shadow-primary/75"
                />
              </Suspense>
            </div>
          </div>
        ) : (
          title && (
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
          )
        )}
      </HeroMedia>
      {layout === 'legal' ? (
        <div className="container py-20">
          <div className="mx-auto grid w-full max-w-7xl lg:grid-cols-12 gap-16 items-start">
            <div className="min-w-0 lg:col-span-8 [&_h2]:scroll-mt-24 [&_h3]:scroll-mt-24 [&_h4]:scroll-mt-24">
              <RenderBlocks blocks={content} />
            </div>
            <ArticleSidebar headings={legalHeadings} className="lg:col-span-4 w-auto" />
          </div>
        </div>
      ) : (
        <RenderBlocks blocks={content} />
      )}

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
