import { Suspense } from 'react'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import config from '@payload-config'
import { getPayload } from 'payload'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { ArticleSidebar, TableOfContents } from '@/components/ArticleSidebar'
import { Headline } from '@/components/Headline'
import { HeroMedia } from '@/components/HeroMedia'
import { PageContainer } from '@/components/PageContainer'
import { RichText } from '@/components/RichText'
import { extractHeadings } from '@/lib/extractHeadings'
import { extractSections } from '@/lib/extractSections'
import { fetchPageBySlug } from '@/lib/fetchers/fetchPageBySlug'
import { generateMeta } from '@/lib/generateMeta'
import { isEmptyValue } from '@/lib/lexical/isEmptyValue'
import { placeholderParams } from '@/lib/placeholderParams'
import { highlightRichText } from '@/lib/shiki/highlightRichText'
import { CollectionSlug } from '@/types/collections'

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
    <Suspense>
      <Page {...props} />
    </Suspense>
  )
}

async function Page({ params }: PageProps<'/[slug]'>) {
  const { slug = 'home' } = await params
  const { isEnabled: draft } = await draftMode()

  const page = await fetchPageBySlug({ slug, draft })

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
                  className="textshadow-lg font-mono text-4xl leading-tight text-balance text-foreground shadow-primary/75 [&_h1]:text-4xl [&_h2]:text-3xl [&_h3]:text-2xl [&_p]:text-4xl"
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
                  className="textshadow-lg text-balance text-foreground shadow-primary/75"
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
          <div className="mx-auto grid w-full max-w-7xl items-start gap-16 lg:grid-cols-12">
            <div className="min-w-0 lg:col-span-8 [&_h2]:scroll-mt-24 [&_h3]:scroll-mt-24 [&_h4]:scroll-mt-24">
              <RenderBlocks blocks={content} />
            </div>
            <ArticleSidebar
              className="w-auto lg:col-span-4"
              sections={[
                legalHeadings &&
                  legalHeadings.length > 0 && {
                    title: 'On This Page',
                    children: <TableOfContents headings={legalHeadings} />,
                  },
              ]}
            />
          </div>
        </div>
      ) : (
        <RenderBlocks blocks={content} />
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
  })
}
