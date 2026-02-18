import { CollectionSlug } from '@custom-types'
import config from '@payload-config'
import type { BlogCategory, BlogPost as BlogPostType, BlogTag, MediaImage as MediaType } from '@payload-types'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import { cache } from 'react'

import { Headline } from '@/components/Headline'
import { PageContainer } from '@/components/PageContainer'
import RichText from '@/components/RichText'
import { generateMeta } from '@/utilities/generateMeta'
import { generateBlogPosting, generateBreadcrumbList, JsonLd } from '@/utilities/jsonLd'

export async function generateStaticParams() {
  const payload = await getPayload({ config })
  const { docs = [] } = await payload.find({
    collection: CollectionSlug.BlogPosts,
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

  const post: BlogPostType = await queryPostBySlug({ slug })
  if (!post) return notFound()

  const { title, content, heroImage, createdAt, updatedAt, categories, tags } = post
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://danielheene.de'
  const postUrl = `${baseUrl}/posts/${slug}`

  // Extract hero image data
  const hero = typeof heroImage === 'object' ? (heroImage as MediaType) : null
  const heroImageData = hero?.url
    ? {
        url: `${baseUrl}${hero.url}`,
        width: hero.width || undefined,
        height: hero.height || undefined,
        alt: hero.alt || title,
      }
    : undefined

  // Extract keywords from tags
  const postTags = tags ? tags.map((tag) => (typeof tag === 'object' ? (tag as BlogTag).title : '')).filter(Boolean) : undefined

  // Get category name for breadcrumb
  const category = typeof categories === 'object' ? (categories as BlogCategory) : null
  const categoryName = category?.title || 'Blog'
  const categorySlug = category?.slug || ''

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
    keywords: postTags,
  })

  // Generate BreadcrumbList schema
  const breadcrumbSchema = generateBreadcrumbList([
    { name: 'Home', url: baseUrl },
    { name: categoryName, url: `${baseUrl}/categories/${categorySlug}` },
    { name: title },
  ])

  return (
    <PageContainer>
      <JsonLd data={[blogPostingSchema, breadcrumbSchema]} />
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
  const doc: BlogPostType = await queryPostBySlug({ slug })
  return generateMeta({ doc })
}

const queryPostBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config })

  const { docs = [] } = await payload.find({
    collection: CollectionSlug.BlogPosts,
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

  return docs[0] || null
})
