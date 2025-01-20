import { Metadata, ResolvedMetadata } from 'next'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import { draftMode } from 'next/headers'
import React, { cache, Fragment } from 'react'

import configPromise from '@payload-config'
import { Media, Page as PageType } from '@payload-types'
import { generateMeta } from '@/utilities/generateMeta'
import { notFound } from 'next/navigation'
import { Headline } from '@/components/Headline'
import RichText from '@/components/RichText'
import { ImageMedia } from '@/components/ImageMedia'
import { getCachedGlobal } from '@/utilities/getGlobals'

export async function generateStaticParams() {
  const payload = await getPayloadHMR({ config: configPromise })
  const pages = await payload.find({
    collection: 'pages',
    draft: false,
    limit: 1000,
    overrideAccess: false,
  })

  return pages.docs.map(({ slug }) => slug)
}

type PageProps = {
  params: Promise<{ slug: string }>
}
export default async function Page({ params }: PageProps) {
  const { slug } = await params
  const page = await queryPageBySlug({ slug })
  if (!page) return notFound()

  const { content, hero: heroMedia, title } = page
  const hero = heroMedia as Media
  return (
    <Fragment>
      <header className="relative pt-32 -mt-32">
        {hero && (
          <ImageMedia
            url={hero.url}
            className="absolute top-0 left-0 right-0 bottom-0 border-b-2 border-b-primary"
            alt={`${title} Hero Image`}
            width={hero.width}
            height={hero.height}
            blurHash={hero.blurHash}
            priority
            fill
            duoTone
          />
        )}
        <Headline
          variant="page-title"
          className="relative z-10 mt-28 mb-32 text-white textshadow-lg shadow-primary/75"
        >
          {title}
        </Headline>
      </header>
      <article className="container py-12">
        <RichText content={content} enableGutter={false} />
      </article>
    </Fragment>
  )
}

export async function generateMetadata(
  { params }: PageProps,
  parent: Promise<ResolvedMetadata>,
): Promise<Metadata> {
  const { slug } = await params
  const page = await queryPageBySlug({
    slug,
  })

  const globalMeta = await getCachedGlobal('settingsMeta', 1)()
  const parentMeta = await parent

  return generateMeta({ doc: page, globalMeta, parentMeta })
}

const queryPageBySlug = cache(async ({ slug }: { slug: string }): Promise<PageType | null> => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayloadHMR({ config: configPromise })

  const result = await payload.find({
    collection: 'pages',
    draft,
    limit: 1,
    overrideAccess: true,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})
