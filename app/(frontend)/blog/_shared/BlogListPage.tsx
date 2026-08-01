import { Suspense } from 'react'
import { cacheLife, cacheTag } from 'next/cache'
import Link from 'next/link'
import config from '@payload-config'
import { getPayload } from 'payload'

import { format } from 'date-fns'

import { ImageMedia } from '@/components/ImageMedia'
import { PageContainer } from '@/components/PageContainer'
import { cn } from '@/lib/cn'
import { CollectionSlug } from '@/types/collections'
import type { BlogPostData, Topic } from '@/types/payload'

import { FeaturedTopics } from '../[slug]/components/FeaturedTopics'

export const POSTS_PER_PAGE = 12

/**
 * Parses a `/page/<n>` segment. Returns null for anything that is not a
 * positive integer so the route can 404 rather than silently showing page 1 —
 * `/blog/page/abc` should not be a soft-200.
 */
export const resolvePageParam = (raw: string | string[] | undefined): number | null => {
  const value = Array.isArray(raw) ? raw[0] : raw
  if (!value || !/^[0-9]+$/.test(value)) return null

  const parsed = Number.parseInt(value, 10)
  return parsed >= 1 ? parsed : null
}

export const queryPublishedTopicBySlug = async (slug: string): Promise<Topic | null> => {
  'use cache'
  cacheLife('max')
  cacheTag(CollectionSlug.BlogTopics)

  const payload = await getPayload({
    config,
  })

  const { docs = [] } = await payload.find({
    collection: CollectionSlug.BlogTopics,
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

  return (docs[0] as Topic) ?? null
}

const queryPublishedPosts = async ({ topicId, page }: { topicId?: string; page: number }) => {
  'use cache'
  cacheLife('max')
  cacheTag(CollectionSlug.BlogPosts)

  const payload = await getPayload({
    config,
  })

  return payload.find({
    collection: CollectionSlug.BlogPosts,
    draft: false,
    overrideAccess: false,
    limit: POSTS_PER_PAGE,
    page,
    sort: '-createdAt',
    depth: 2,
    ...(topicId
      ? {
          where: {
            'topics.value': {
              equals: topicId,
            },
          },
        }
      : {}),
  })
}

const PostCard = ({ post }: { post: BlogPostData }) => {
  // populated upload values omit mimeType, so isMediaImage() can't be used —
  // the relation's target collection is the reliable discriminator
  const heroImage =
    post.heroImage?.relationTo === CollectionSlug.MediaImages ? post.heroImage.value : undefined

  return (
    <Link
      href={`/blog/post/${post.slug}`}
      className={cn([
        'group relative isolate h-80 overflow-hidden rounded-lg bg-background',
      ])}
    >
      <div
        className={cn([
          'z-10 flex h-full flex-col justify-between p-6',
        ])}
      >
        <p
          className={cn([
            'text-muted-foreground transition-colors duration-500 group-hover:text-background',
          ])}
        >
          {format(post.createdAt, 'MMMM d, yyyy')}
        </p>
        <h2
          className={cn([
            'line-clamp-2 text-xl font-medium transition-colors duration-500 group-hover:text-background',
          ])}
        >
          {post.title}
        </h2>
      </div>
      {heroImage && typeof heroImage === 'object' && heroImage.url && (
        <ImageMedia
          url={heroImage.url}
          alt={heroImage.alt || post.title}
          blurDataURL={heroImage.blurDataURL}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className={cn([
            'absolute inset-0 -z-10 size-full rounded-lg object-cover brightness-50 transition-all duration-500 ease-[cubic-bezier(0.77,0,0.175,1)] [clip-path:inset(0_0_100%_0)] group-hover:[clip-path:inset(0_0_0%_0)]',
          ])}
        />
      )}
    </Link>
  )
}

const Pagination = ({
  basePath,
  page,
  totalPages,
}: {
  basePath: string
  page: number
  totalPages: number
}) => {
  if (totalPages <= 1) return null

  const pageHref = (target: number) => (target <= 1 ? basePath : `${basePath}/page/${target}`)

  return (
    <nav
      aria-label="Pagination"
      className={cn([
        'col-span-full mt-8 flex items-center justify-center gap-2 font-mono',
      ])}
    >
      {page > 1 && (
        <Link
          href={pageHref(page - 1)}
          rel="prev"
          className={cn([
            'rounded-md border border-border px-3 py-1.5 text-sm transition-colors hover:bg-muted',
          ])}
        >
          Previous
        </Link>
      )}
      {Array.from(
        {
          length: totalPages,
        },
        (_, index) => index + 1,
      ).map((target) => (
        <Link
          key={target}
          href={pageHref(target)}
          aria-current={target === page ? 'page' : undefined}
          className={cn([
            'rounded-md border px-3 py-1.5 text-sm transition-colors',
            target === page
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border hover:bg-muted',
          ])}
        >
          {target}
        </Link>
      ))}
      {page < totalPages && (
        <Link
          href={pageHref(page + 1)}
          rel="next"
          className={cn([
            'rounded-md border border-border px-3 py-1.5 text-sm transition-colors hover:bg-muted',
          ])}
        >
          Next
        </Link>
      )}
    </nav>
  )
}

const PostsGrid = async ({
  topicId,
  basePath,
  page,
}: {
  topicId?: string
  basePath: string
  page: number
}) => {
  const {
    docs: posts,
    totalPages,
    page: currentPage = 1,
  } = await queryPublishedPosts({
    topicId,
    page,
  })

  if (posts.length === 0) {
    return (
      <p
        className={cn([
          'text-muted-foreground',
        ])}
      >
        No posts published yet.
      </p>
    )
  }

  return (
    <>
      {posts.map((post) => (
        <PostCard key={post.id} post={post as BlogPostData} />
      ))}
      <Pagination basePath={basePath} page={currentPage} totalPages={totalPages} />
    </>
  )
}

/**
 * Total number of pages for a listing, used by the paginated routes to reject
 * out-of-range URLs. The check cannot live inside the grid: that renders behind
 * a Suspense boundary, where notFound() no longer changes the response status.
 */
export const countTotalPages = async (topicId?: string): Promise<number> => {
  'use cache'
  cacheLife('max')
  cacheTag(CollectionSlug.BlogPosts)

  const payload = await getPayload({
    config,
  })

  const { totalDocs } = await payload.count({
    collection: CollectionSlug.BlogPosts,
    overrideAccess: false,
    ...(topicId
      ? {
          where: {
            'topics.value': {
              equals: topicId,
            },
          },
        }
      : {}),
  })

  return Math.max(1, Math.ceil(totalDocs / POSTS_PER_PAGE))
}

export interface BlogListPageProps {
  /** Topic to filter by; omitted on the unfiltered /blog listing. */
  topic?: Topic | null
  /** 1-based page number taken from the route. */
  page: number
}

/**
 * Shared post listing rendered by every blog route: /blog, /blog/<topic> and
 * their /page/<n> variants. Keeping one component means the layout, header and
 * pagination cannot drift between them.
 */
export const BlogListPage = async ({ topic, page }: BlogListPageProps) => {
  const basePath = topic ? `/blog/${topic.slug}` : '/blog'

  return (
    <PageContainer>
      <section
        className={cn([
          'py-32 w-full',
        ])}
      >
        <div
          className={cn([
            'container',
          ])}
        >
          <div
            className={cn([
              'relative mx-auto flex max-w-7xl flex-col gap-20 lg:flex-row',
            ])}
          >
            <header
              className={cn([
                'top-10 flex h-fit flex-col items-center gap-5 text-center lg:sticky lg:max-w-80 lg:items-start lg:gap-8 lg:text-left',
              ])}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={24}
                height={24}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1}
                strokeLinecap="round"
                strokeLinejoin="round"
                className={cn([
                  'lucide lucide-file-text h-full w-14',
                ])}
                aria-hidden="true"
              >
                <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
                <path d="M14 2v5a1 1 0 0 0 1 1h5" />
                <path d="M10 9H8" />
                <path d="M16 13H8" />
                <path d="M16 17H8" />
              </svg>
              <h1
                className={cn([
                  'text-4xl font-extrabold lg:text-5xl',
                ])}
              >
                {topic ? topic.title : 'All Posts'}
              </h1>
              <p
                className={cn([
                  'text-muted-foreground lg:text-xl',
                ])}
              >
                Blog posts are a great way to share your knowledge and expertise with the world.
              </p>
              <div
                data-orientation="horizontal"
                role="none"
                data-slot="separator"
                className={cn([
                  'bg-border shrink-0 data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch',
                ])}
              />
              <nav>
                <Suspense>
                  <FeaturedTopics currentSlug={topic ? topic.slug : '/'} />
                </Suspense>
              </nav>
            </header>
            <div
              className={cn([
                'grid flex-1 gap-4 md:grid-cols-2',
              ])}
            >
              <Suspense
                fallback={
                  <>
                    {Array.from(
                      {
                        length: 4,
                      },
                      (_, index) => (
                        <div
                          key={index}
                          className={cn([
                            'h-80 animate-pulse rounded-lg bg-muted',
                          ])}
                        />
                      ),
                    )}
                  </>
                }
              >
                <PostsGrid topicId={topic?.id} basePath={basePath} page={page} />
              </Suspense>
            </div>
          </div>
        </div>
      </section>
    </PageContainer>
  )
}
