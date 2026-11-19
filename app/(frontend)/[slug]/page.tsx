import { Suspense } from 'react'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import config from '@payload-config'
import { getPayload } from 'payload'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RESUME_PAGE_SLUG } from '@/collections/Pages/constants'
import { ArticleLayout } from '@/components/ArticleLayout'
import { Headline } from '@/components/Headline'
import { HeroMedia } from '@/components/HeroMedia'
import { PageContainer } from '@/components/PageContainer'
import { PageFallback } from '@/components/PageFallback'
import { RichText } from '@/components/RichText'
import { extractHeadings } from '@/lib/extractHeadings'
import { fetchPageBySlug } from '@/lib/fetchers/fetchPageBySlug'
import { generateMeta } from '@/lib/generateMeta'
import { isEmptyValue } from '@/lib/lexical/isEmptyValue'
import { placeholderParams } from '@/lib/placeholderParams'
import { highlightRichText } from '@/lib/shiki/highlightRichText'
import { CollectionSlug } from '@/types/collections'
import type { LinkGroupData } from '@/types/payload'
import { PAGE_LAYOUT } from '@/types/select-options'

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

export default async function PageShell(props: PageProps<'/[slug]'>) {
  return (
    <Suspense fallback={<PageFallback />}>
      <Page {...props} />
    </Suspense>
  )
}

async function Page({ params }: PageProps<'/[slug]'>) {
  const { slug } = await params
  const { isEnabled: draft } = await draftMode()

  const page = await fetchPageBySlug({ slug, draft })

  if (!page) notFound()

  const { title, layout, hero, content, sections, links } = page
  // SAFETY: the fetcher reduces localized fields to one language, which only
  // changes the static type; the stored link group has the LinkGroupData shape.
  const linkGroup = links as LinkGroupData

  // Only the resume page gets the section navigation. Same extraction
  // `RenderBlocks` runs, so these ids match the rendered anchors.
  const navigationSections =
    layout === PAGE_LAYOUT.SECTIONS && slug === RESUME_PAGE_SLUG
      ? extractHeadings(sections ?? []).filter(({ kind }) => kind === 'section')
      : []

  const useCustomHeroContent = hero?.contentType === 'custom' && !isEmptyValue(hero.content)

  const highlightedHeroCode = useCustomHeroContent
    ? await highlightRichText(hero?.content)
    : undefined

  return (
    <PageContainer layout={layout} sections={navigationSections}>
      <HeroMedia
        align={useCustomHeroContent ? 'center' : 'bottom'}
        className="border-b-2 border-b-primary"
        fallbackAlt={title || 'Hero Image'}
        slides={hero?.slides}
      >
        {useCustomHeroContent ? (
          <div className="py-20">
            <div className="container">
              {/* RichText is a Client Component that calls randomUUID(), which
                  Cache Components requires to sit behind a Suspense boundary. */}
              <Suspense fallback={<div className="h-24 animate-pulse rounded-lg bg-muted" />}>
                <RichText
                  data={hero.content}
                  enableGutter={false}
                  enableProse={false}
                  highlightedCode={highlightedHeroCode}
                  className="textshadow-lg font-mono text-4xl leading-tight text-balance shadow-primary/75 [&_h1]:text-4xl [&_h2]:text-3xl [&_h3]:text-2xl [&_p]:text-4xl"
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
                  className="textshadow-lg text-balance shadow-primary/75"
                >
                  {title}
                </Headline>
              </div>
            </div>
          )
        )}
      </HeroMedia>
      {layout === PAGE_LAYOUT.SECTIONS ? (
        <RenderBlocks blocks={sections} />
      ) : (
        <ArticleLayout content={content} links={linkGroup} />
      )}

      {/*{draft && <LivePreviewListener />}*/}
    </PageContainer>
  )
}

export async function generateMetadata({ params }: PageProps<'/[slug]'>): Promise<Metadata> {
  const { slug = 'home' } = await params
  const doc = await fetchPageBySlug({ slug })

  return generateMeta({
    doc,
    collection: CollectionSlug.Pages,
  })
}
