import { Suspense } from 'react'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import config from '@payload-config'
import { getPayload } from 'payload'

import { format } from 'date-fns'

import { ArticleLayout } from '@/components/ArticleLayout'
import { HeroMedia } from '@/components/HeroMedia'
import { PageFallback } from '@/components/PageFallback'
import { fetchPostBySlug } from '@/lib/fetchers/fetchPostBySlug'
import { generateMeta } from '@/lib/generateMeta'
import { generateBlogPosting, generateBreadcrumbList } from '@/lib/jsonLd'
import { placeholderParams } from '@/lib/placeholderParams'
import { CollectionSlug } from '@/types/collections'
import { LinkGroupData } from '@/types/payload'

import { size } from './opengraph-image'

export async function generateStaticParams() {
  const payload = await getPayload({
    config,
  })

  const { docs = [] } = await payload.find({
    collection: CollectionSlug.BlogPosts,
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    where: {
      or: [
        {
          _status: {
            equals: 'published',
          },
        },
        {
          _status: {
            exists: false,
          },
        },
      ],
    },
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

export default async function BlogPostShell(props: PageProps<'/blog/post/[slug]'>) {
  return (
    <Suspense fallback={<PageFallback />}>
      <BlogPost {...props} />
    </Suspense>
  )
}

async function BlogPost({ params }: PageProps<'/blog/post/[slug]'>) {
  const { slug } = await params
  const { isEnabled: draft } = await draftMode()

  const post = await fetchPostBySlug({ slug, draft })

  if (!post) return notFound()

  const { title, content, hero, createdAt, updatedAt, topics, links } = post
  // SAFETY: the fetcher reduces localized fields to one language, which only
  // changes the static type; the stored link group has the LinkGroupData shape.
  const linkGroup = links as LinkGroupData
  const baseUrl = process.env.SERVER_URL
  const postUrl = `${baseUrl}/blog/post/${slug}`

  // topics are a polymorphic hasMany relation — only populated entries are usable
  const topicList = (topics ?? [])
    .map(({ value }) => value)
    .filter((value) => typeof value === 'object' && value !== null)

  const primaryTopic = topicList[0]

  const heroImageData = {
    url: `${postUrl}/opengraph-image`,
    width: size.width,
    height: size.height,
    alt: title,
  }

  // Generate BlogPosting schema
  // oxlint-disable-next-line no-unused-vars
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
  // oxlint-disable-next-line no-unused-vars
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
    <div className="flex w-full flex-col bg-background text-foreground">
      <div className="flex flex-1 items-center justify-center">
        <section className="w-full">
          <HeroMedia fallbackAlt={title} slides={hero?.slides}>
            <div className="pt-40 pb-16">
              <div className="container flex flex-col items-center gap-8 text-center">
                <nav aria-label="breadcrumb">
                  <ol className="flex flex-wrap items-center justify-center gap-1.5 text-sm wrap-break-word text-white/70 sm:gap-2.5">
                    <li className="inline-flex items-center gap-1.5">
                      <Link className="transition-colors hover:text-white" href="/blog">
                        Blog
                      </Link>
                    </li>
                    {primaryTopic && (
                      <>
                        <li aria-hidden="true" className="[&>svg]:size-3.5">
                          /
                        </li>
                        <li className="inline-flex items-center gap-1.5">
                          <Link
                            className="transition-colors hover:text-white"
                            href={`/blog/${primaryTopic.slug}`}
                          >
                            {primaryTopic.title}
                          </Link>
                        </li>
                      </>
                    )}
                  </ol>
                </nav>
                <div className="flex w-full max-w-5xl flex-col gap-5">
                  <div className="flex items-center justify-center gap-2.5 font-mono text-sm font-semibold text-white/80">
                    <time dateTime={createdAt}>{format(createdAt, 'MMMM d, yyyy')}</time>
                  </div>
                  <h1 className="font-mono text-[2.5rem] leading-[1.1] font-semibold text-balance md:text-6xl lg:text-7xl">
                    {title}
                  </h1>
                  {post.meta?.description && (
                    <p className="text-xl leading-[1.4] text-pretty text-white/80">
                      {post.meta.description}
                    </p>
                  )}
                  {topicList.length > 0 && (
                    <ul className="flex flex-wrap items-center justify-center gap-2">
                      {topicList.map((topic) => (
                        <li key={topic.id}>
                          <Link
                            href={`/blog/${topic.slug}`}
                            className="rounded-full border border-white/25 bg-white/10 px-3 py-1 font-mono text-xs backdrop-blur-sm transition-colors hover:bg-white/20"
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

          <ArticleLayout
            content={content}
            links={linkGroup}
            emptyMessage="This post has no content yet."
          />
        </section>
      </div>
    </div>
  )
}

export async function generateMetadata({
  params,
}: PageProps<'/blog/post/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  const doc = await fetchPostBySlug({ slug })

  return generateMeta({
    doc,
  })
}
