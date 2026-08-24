// biome-ignore-all lint: reason

import { cache, Suspense } from 'react'
import type { Metadata } from 'next'
import { cacheLife, cacheTag } from 'next/cache'
import { draftMode } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import config from '@payload-config'
import { getPayload } from 'payload'

import { format } from 'date-fns'

import { ArticleSidebar } from '@/components/ArticleSidebar'
import { HeroMedia } from '@/components/HeroMedia'
import { RichText } from '@/components/RichText'
import { extractHeadings } from '@/lib/extractHeadings'
import { generateMeta } from '@/lib/generateMeta'
import { reduceDataToBilingualLanguage } from '@/lib/i18n'
import { generateBlogPosting, generateBreadcrumbList } from '@/lib/jsonLd'
import { placeholderParams } from '@/lib/placeholderParams'
import { resolveRelations } from '@/lib/resolveRelation'
import { highlightRichText } from '@/lib/shiki/highlightRichText'
import { CollectionData, CollectionSlug } from '@/types/collections'

import { size } from './opengraph-image'

export async function generateStaticParams() {
  const payload = await getPayload({
    config,
  })

  const { docs = [] } = await payload.find({
    collection: CollectionSlug['BlogPosts'],
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  if (docs.length === 0) {
    return placeholderParams('/blog/post/[slug]')
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

export default async function Page({ params: paramsPromise }: PageProps) {
  const { slug } = await paramsPromise

  const post = await queryPostBySlug({
    slug,
  })
  if (!post) return notFound()

  const { title, content, hero, createdAt, updatedAt, topics } = post
  const baseUrl = process.env.SERVER_URL || 'https://danielheene.de'
  const postUrl = `${baseUrl}/posts/${slug}`

  const headings = extractHeadings(content)
  // Shiki is server-only, so code blocks are highlighted here and handed to
  // RichText, which renders on the client
  const highlightedCode = await highlightRichText(content)

  // topics are a polymorphic hasMany relation — only populated entries are usable
  const topicList = (topics ?? [])
    .map(({ value }) => value)
    .filter((value) => typeof value === 'object' && value !== null)
  const primaryTopic = topicList[0]

  const heroImageData = {
    url: `${baseUrl}/blog/post/${slug}/opengraph-image`,
    width: size.width,
    height: size.height,
    alt: title,
  }
  //
  // // Extract keywords from tags
  // const postTags = tags
  //   ? tags.map((tag) => (typeof tag === 'object' ? (tag as BlogTopic).title : '')).filter(Boolean)
  //   : undefined

  // Get category name for breadcrumb
  // const category =
  //   typeof categories === 'object' ? (categories as BlogCategory) : null
  // const categoryName = category?.title || 'Blog'
  // const categorySlug = category?.slug || ''

  // Generate BlogPosting schema
  const blogPostingSchema = generateBlogPosting({
    headline: title,
    url: postUrl,
    datePublished: createdAt,
    dateModified: updatedAt || createdAt,
    image: heroImageData,
    author: {
      name: 'Daniel Heene',
      url: baseUrl,
    },
    // keywords: postTags,
  })

  // Generate BreadcrumbList schema
  const breadcrumbSchema = generateBreadcrumbList([
    {
      name: 'Home',
      url: baseUrl,
    },
    // {
    //   name: categoryName,
    //   url: `${baseUrl}/categories/${categorySlug}`,
    // },
    {
      name: title,
    },
  ])

  return (
    <div className="flex  w-full flex-col bg-background text-foreground">
      <div className="flex flex-1 items-center justify-center">
        <section className="pb-32 w-full">
          {/* A post carries at most one hero image, so this never becomes a carousel. */}
          <HeroMedia fallbackAlt={title} background={hero?.background}>
            <div className="pt-40 pb-16">
              <div className="container flex flex-col items-center gap-8 text-center">
                <nav aria-label="breadcrumb">
                  <ol className="text-foreground/70 gap-1.5 text-sm sm:gap-2.5 flex flex-wrap items-center justify-center wrap-break-word">
                    <li className="gap-1.5 inline-flex items-center">
                      <Link className="hover:text-foreground transition-colors" href="/blog">
                        Blog
                      </Link>
                    </li>
                    {primaryTopic && (
                      <>
                        <li aria-hidden="true" className="[&>svg]:size-3.5">
                          /
                        </li>
                        <li className="gap-1.5 inline-flex items-center">
                          <Link
                            className="hover:text-foreground transition-colors"
                            href={`/blog/${primaryTopic.slug}`}
                          >
                            {primaryTopic.title}
                          </Link>
                        </li>
                      </>
                    )}
                  </ol>
                </nav>
                <div className="flex w-full max-w-5xl  flex-col gap-5">
                  <div className="flex items-center justify-center gap-2.5 font-mono text-sm text-foreground/60">
                    <time dateTime={createdAt}>{format(createdAt, 'MMMM d, yyyy')}</time>
                  </div>
                  <h1 className="text-[2.5rem] leading-[1.1] font-semibold text-balance md:text-6xl lg:text-7xl">
                    {title}
                  </h1>
                  {post.meta?.description && (
                    <p className="text-xl leading-[1.4] text-pretty text-foreground/80">
                      {post.meta.description}
                    </p>
                  )}
                  {topicList.length > 0 && (
                    <ul className="flex flex-wrap items-center justify-center gap-2">
                      {topicList.map((topic) => (
                        <li key={topic.id}>
                          <Link
                            href={`/blog/${topic.slug}`}
                            className="rounded-full border border-foreground/25 bg-background/30 px-3 py-1 font-mono text-xs backdrop-blur-sm transition-colors hover:bg-background/60"
                          >
                            {topic.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </HeroMedia>

          <div className="container pt-20">
            <div className="mx-auto flex w-full max-w-5xl items-start justify-between gap-16">
              {/* scroll-mt keeps TOC anchor targets clear of the fixed header */}
              <article className="w-full min-w-0 max-w-[46rem] [&_h2]:scroll-mt-24 [&_h3]:scroll-mt-24 [&_h4]:scroll-mt-24">
                {content ? (
                  // RichText is a Client Component that calls randomUUID(), which
                  // Cache Components requires to sit behind a Suspense boundary
                  <Suspense fallback={<div className="h-96 animate-pulse rounded-lg bg-muted" />}>
                    <RichText
                      data={content}
                      enableGutter={false}
                      highlightedCode={highlightedCode}
                    />
                  </Suspense>
                ) : (
                  <p className="text-muted-foreground">This post has no content yet.</p>
                )}
              </article>

              <ArticleSidebar headings={headings} />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export async function generateMetadata({ params: paramsPromise }: PageProps): Promise<Metadata> {
  const { slug } = await paramsPromise
  const doc = await queryPostBySlug({
    slug,
  })
  return generateMeta({
    doc,
  })
}

const queryPublishedPostBySlug = async (
  slug: string,
): Promise<CollectionData<CollectionSlug['BlogPosts']>> => {
  'use cache'
  cacheLife('max')
  cacheTag(CollectionSlug.BlogPosts)

  const payload = await getPayload({
    config,
  })

  const { docs = [] } = await payload.find({
    collection: CollectionSlug['BlogPosts'],
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

  if (!docs[0]) return null

  return reduceDataToBilingualLanguage(await resolveRelations(docs[0]))
}

const queryDraftPostBySlug = async (
  slug: string,
): Promise<CollectionData<CollectionSlug['BlogPosts']>> => {
  const payload = await getPayload({
    config,
  })

  const { docs = [] } = await payload.find({
    collection: CollectionSlug['BlogPosts'],
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

  if (!docs[0]) return null

  return reduceDataToBilingualLanguage(await resolveRelations(docs[0]))
}

export const queryPostBySlug = cache(
  async ({ slug }: { slug: string }): Promise<CollectionData<CollectionSlug['BlogPosts']>> => {
    const { isEnabled: draft } = await draftMode()
    return draft ? queryDraftPostBySlug(slug) : queryPublishedPostBySlug(slug)
  },
)
