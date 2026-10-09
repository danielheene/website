import { Suspense } from 'react'
import { cacheLife, cacheTag } from 'next/cache'
import Image from 'next/image'
import Link from 'next/link'
import config from '@payload-config'
import { getPayload } from 'payload'

import { format } from 'date-fns'
import { cn } from 'tailwind-variants'

import { Button } from '@/components/Button'
import { DuoTone } from '@/components/DuoTone'
import { SHADER_PRESET_MAP } from '@/components/HeroMedia/shaderPresets'
import { toSlideItems } from '@/components/HeroMedia/toSlideItems'
import { ImageMedia } from '@/components/ImageMedia'
import { PageContainer } from '@/components/PageContainer'
import { Pagination } from '@/components/Pagination'
import { Reveal } from '@/components/Reveal'
import { RichText } from '@/components/RichText'
import {
  BLOG_PATH,
  BLOG_SORT_OPTIONS,
  BLOG_SORTS,
  type BlogSort,
  buildBlogListingHref,
  POSTS_PER_PAGE,
  parseBlogListingParams,
} from '@/lib/blog/listing'
import { isEmptyValue } from '@/lib/lexical/isEmptyValue'
import { CollectionSlug } from '@/types/collections'
import type { BlogPostData, Topic } from '@/types/payload'

import { FeaturedTopics } from '../[slug]/components/FeaturedTopics'

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

const queryPublishedPosts = async ({
  topicId,
  page,
  sort,
}: {
  topicId?: string
  page: number
  sort: BlogSort
}) => {
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
    sort: [...BLOG_SORT_OPTIONS[sort].sort],
    depth: 2,
    where: {
      // already implied by authenticatedOrPublished; kept explicit so the
      // listing stays correct should the query ever run with overrideAccess
      _status: {
        equals: 'published',
      },
      ...(topicId
        ? {
            'topics.value': {
              equals: topicId,
            },
          }
        : {}),
    },
  })
}

// The Suspense fallback and the streamed grid share it, so the skeletons line
// up with the cards that replace them.
const POSTS_GRID_CLASS = cn(['grid gap-4 md:grid-cols-2'])

const PostCard = ({ post }: { post: BlogPostData }) => {
  // Only the card's first slide is shown — a fixed-size card can't depict a
  // carousel. A video slide's poster stands in for its thumbnail, same as
  // HeroSlide does for the real hero. Guarded like the OG image routes:
  // `shader` is typed as the preset-key union but the value comes from the
  // database, so a preset that has since been renamed or removed resolves to
  // no background image rather than throwing and taking down the list.
  const [firstSlide] = toSlideItems(post.hero?.slides, post.title)

  const heroImageUrl =
    firstSlide?.kind === 'image'
      ? firstSlide.url
      : firstSlide?.kind === 'video'
        ? firstSlide.poster
        : undefined
  const heroImageAlt = firstSlide?.kind === 'image' ? firstSlide.alt : post.title
  const heroImageBlurDataURL = firstSlide?.kind === 'image' ? firstSlide.blurDataURL : undefined
  const shaderThumbnail =
    firstSlide?.kind === 'shader' ? SHADER_PRESET_MAP[firstSlide.presetKey]?.thumbnail : undefined

  return (
    <Link
      href={`/blog/post/${post.slug}`}
      data-reveal-item
      className={cn(['group relative isolate h-80 overflow-hidden bg-background'])}
    >
      <DuoTone>
        {heroImageUrl && (
          <ImageMedia
            url={heroImageUrl}
            alt={heroImageAlt || post.title}
            blurDataURL={heroImageBlurDataURL}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="absolute inset-0 size-full object-cover"
          />
        )}
        {shaderThumbnail && (
          <Image
            src={shaderThumbnail}
            alt=""
            fill
            className="absolute inset-0 size-full object-cover"
          />
        )}
      </DuoTone>
      <div className={cn(['absolute inset-0 size-full flex flex-col justify-between'])}>
        <p
          className={cn([
            'text-background px-6 pt-2.5 pb-10 font-pp-supply-sans',
            'dark:text-foreground text-right',
            'bg-linear-to-b from-primary/95 to-primary/0',
          ])}
        >
          {format(post.createdAt, 'MMMM d, yyyy')}
        </p>
        <header
          className={cn([
            'text-background px-6 pb-4 pt-16 font-pp-supply-sans',
            'dark:text-foreground line-clamp-2 text-xl leading-normal  font-medium',
            'bg-linear-to-b from-primary/0 to-primary/95',
          ])}
        >
          <h2
            className={cn([
              'text-background block font-pp-supply-sans font-medium',
              'dark:text-foreground text-2xl leading-8 line-clamp-2 h-[calc(var(--tw-leading)*2)]',
            ])}
          >
            {post.title}
          </h2>
          {!isEmptyValue(post.excerpt) && (
            <RichText
              data={post.excerpt}
              enableGutter={false}
              enableProse={false}
              className={cn([
                'text-background/80 mt-1 line-clamp-2 text-sm font-normal',
                'dark:text-foreground/80',
                // Paragraphs run on as one text so the two-line clamp applies
                // across all of them.
                "[&_p]:inline [&_p:not(:last-child)]:after:content-['_']",
              ])}
            />
          )}
        </header>
      </div>
    </Link>
  )
}

const SortControl = ({ basePath, sort }: { basePath: string; sort: BlogSort }) => (
  <nav
    aria-label="Sort posts"
    className={cn(['col-span-full flex flex-wrap items-center justify-end gap-2 font-mono'])}
  >
    {BLOG_SORTS.map((option) => (
      <Button key={option} size="sm" variant={option === sort ? 'default' : 'outline'} asChild>
        <Link
          href={buildBlogListingHref(basePath, {
            sort: option,
          })}
          aria-current={option === sort ? 'true' : undefined}
        >
          {BLOG_SORT_OPTIONS[option].label}
        </Link>
      </Button>
    ))}
  </nav>
)

const PostsGrid = async ({
  topicId,
  basePath,
  searchParams,
}: {
  topicId?: string
  basePath: string
  searchParams: BlogListPageProps['searchParams']
}) => {
  const { page, sort } = parseBlogListingParams(await searchParams)
  const {
    docs: posts,
    totalDocs,
    totalPages,
  } = await queryPublishedPosts({
    topicId,
    page,
    sort,
  })

  if (totalDocs === 0) {
    return <p className={cn(['text-muted-foreground'])}>No posts published yet.</p>
  }

  // The status is already sent by the time this renders (it streams behind a
  // Suspense boundary), so an out-of-range page gets a way back, not a 404.
  if (posts.length === 0) {
    return (
      <p className={cn(['col-span-full text-muted-foreground'])}>
        There is no page {page}.{' '}
        <Link
          href={buildBlogListingHref(basePath, {
            sort,
          })}
          className="underline"
        >
          Back to the first page
        </Link>
      </p>
    )
  }

  return (
    <Reveal className={POSTS_GRID_CLASS}>
      {totalDocs > 1 ? (
        <SortControl basePath={basePath} sort={sort} />
      ) : (
        <div className={cn(['col-span-full h-9'])} aria-hidden />
      )}
      {posts.map((post) => (
        <PostCard key={post.id} post={post as BlogPostData} />
      ))}
      <Pagination
        page={page}
        totalPages={totalPages}
        pageHref={(target) =>
          buildBlogListingHref(basePath, {
            page: target,
            sort,
          })
        }
      />
    </Reveal>
  )
}

export interface BlogListPageProps {
  /** Topic to filter by; omitted on the unfiltered /blog listing. */
  topic?: Topic | null
  /**
   * The route's unresolved `searchParams` (`?page=`, `?sort=`). Passed down as
   * a promise and only awaited inside the grid's Suspense boundary, so the
   * rest of the page still prerenders as a static shell under Cache
   * Components.
   */
  searchParams: PageProps<'/blog'>['searchParams']
}

/**
 * Shared post listing rendered by /blog and /blog/<topic>. Keeping one
 * component means the layout, header and pagination cannot drift between them.
 */
export const BlogListPage = async ({ topic, searchParams }: BlogListPageProps) => {
  const basePath = topic ? `${BLOG_PATH}/${topic.slug}` : BLOG_PATH
  return (
    <PageContainer>
      <section className={cn(['w-full py-32'])}>
        <div className={cn(['container'])}>
          <div className={cn(['mx-auto grid w-full max-w-7xl gap-16 lg:grid-cols-12'])}>
            <header
              className={cn([
                'top-10 flex h-fit flex-col items-center gap-5 text-center lg:col-span-4 lg:sticky lg:items-start lg:gap-8 lg:text-left',
              ])}
            >
              <h1 className={cn(['text-4xl font-extrabold lg:text-5xl font-mono'])}>
                {topic ? topic.title : 'All Posts'}
              </h1>
              {topic?.content && !isEmptyValue(topic.content) && (
                <RichText
                  data={topic.content}
                  enableGutter={false}
                  enableProse={false}
                  className={cn(['text-muted-foreground lg:text-xl'])}
                />
              )}
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
            <div className={cn(['lg:col-span-8'])}>
              <Suspense
                fallback={
                  <div className={POSTS_GRID_CLASS}>
                    {Array.from(
                      {
                        length: 4,
                      },
                      (_, index) => (
                        <div
                          key={index}
                          className={cn(['h-80 animate-pulse rounded-lg bg-muted'])}
                        />
                      ),
                    )}
                  </div>
                }
              >
                <PostsGrid topicId={topic?.id} basePath={basePath} searchParams={searchParams} />
              </Suspense>
            </div>
          </div>
        </div>
      </section>
    </PageContainer>
  )
}
