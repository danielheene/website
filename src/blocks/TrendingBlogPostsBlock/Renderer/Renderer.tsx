'use server'

import Link from 'next/link'

import { Headline } from '@/components/Headline'
import { ImageMedia } from '@/components/ImageMedia'
import { fetchTrendingBlogPosts } from '@/lib/fetchers/fetchTrendingBlogPosts'
import { reduceDataToBilingualLanguage } from '@/lib/i18n'
import { isRenderableImage } from '@/lib/typeGuards'

const TRENDING_WINDOW_DAYS = 7

type TrendingBlogPostsBlockRendererProps = {
  blockType?: string
  heading?: {
    en?: string | null
    de?: string | null
  } | null
  postCount?: number | null
}

export const TrendingBlogPostsBlockRenderer = async ({
  heading,
  postCount,
}: TrendingBlogPostsBlockRendererProps) => {
  const posts = await fetchTrendingBlogPosts({
    days: TRENDING_WINDOW_DAYS,
    limit: postCount ?? 4,
  })

  if (!posts || posts.length === 0) return null

  const resolvedHeading = heading ? reduceDataToBilingualLanguage(heading) : undefined

  return (
    <section className="container mx-auto px-4 py-16">
      {resolvedHeading && (
        <Headline variant="section" className="mb-8">
          {resolvedHeading}
        </Headline>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {posts.map(({ slug, post }) => {
          const heroImage = isRenderableImage(post.heroImage?.value) ? post.heroImage.value : null

          return (
            <Link
              key={slug}
              href={`/blog/post/${slug}`}
              className="group flex flex-col gap-4 rounded-sm border-4 border-primary bg-card overflow-hidden transition-colors hover:border-primary-800"
            >
              {heroImage && (
                <div className="relative aspect-video w-full overflow-hidden">
                  <ImageMedia
                    url={heroImage.url}
                    alt={heroImage.alt ?? post.title}
                    blurDataURL={heroImage.blurDataURL}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    imgClassName="transition-transform duration-300 ease-in-out group-hover:scale-105"
                  />
                </div>
              )}
              <Headline as="h3" variant="subline" className="px-4 pb-4 text-xl">
                {post.title}
              </Headline>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
