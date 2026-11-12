import { Suspense } from 'react'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import config from '@payload-config'
import { getPayload } from 'payload'

import { format } from 'date-fns'

import { ArticleSidebar, TableOfContents } from '@/components/ArticleSidebar'
import { LinkList } from '@/components/ArticleSidebar/LinkList'
import { HeroMedia } from '@/components/HeroMedia'
import { RichText } from '@/components/RichText'
import { extractHeadings } from '@/lib/extractHeadings'
import { fetchPostBySlug } from '@/lib/fetchers/fetchPostBySlug'
import { generateMeta } from '@/lib/generateMeta'
import { generateBlogPosting, generateBreadcrumbList } from '@/lib/jsonLd'
import { placeholderParams } from '@/lib/placeholderParams'
import { highlightRichText } from '@/lib/shiki/highlightRichText'
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
    <Suspense>
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
        <section className="w-full pb-32">
          <HeroMedia fallbackAlt={title} slides={hero?.slides}>
            <div className="pt-40 pb-16">
              <div className="container flex flex-col items-center gap-8 text-center">
                <nav aria-label="breadcrumb">
                  <ol className="flex flex-wrap items-center justify-center gap-1.5 text-sm wrap-break-word text-foreground/70 sm:gap-2.5">
                    <li className="inline-flex items-center gap-1.5">
                      <Link className="transition-colors hover:text-foreground" href="/blog">
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
                            className="transition-colors hover:text-foreground"
                            href={`/blog/${primaryTopic.slug}`}
                          >
                            {primaryTopic.title}
                          </Link>
                        </li>
                      </>
                    )}
                  </ol>
                </nav>
                <div className="flex w-full max-w-5xl flex-col gap-5 text-white">
                  <div className="flex items-center justify-center gap-2.5 font-mono text-sm font-semibold text-white/80">
                    <time dateTime={createdAt}>{format(createdAt, 'MMMM d, yyyy')}</time>
                  </div>
                  <h1 className="font-mono text-[2.5rem] leading-[1.1] font-semibold text-balance md:text-6xl lg:text-7xl">
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
            <div className="mx-auto grid w-full max-w-7xl items-start gap-16 lg:grid-cols-12">
              {/* scroll-mt keeps TOC anchor targets clear of the fixed header */}
              <article className="min-w-0 lg:col-span-8 [&_h2]:scroll-mt-24 [&_h3]:scroll-mt-24 [&_h4]:scroll-mt-24">
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

              <ArticleSidebar
                className="w-auto lg:col-span-4"
                sections={[
                  headings &&
                    headings.length > 0 && {
                      title: 'On This Page',
                      children: <TableOfContents headings={headings} />,
                    },

                  links &&
                    links.length > 0 && {
                      title: 'Links',
                      children: <LinkList links={links as LinkGroupData} />,
                    },
                ].filter(Boolean)}
              />
            </div>
          </div>
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
