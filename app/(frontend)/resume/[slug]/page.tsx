import { Suspense } from 'react'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import config from '@payload-config'
import { getPayload } from 'payload'

import { format } from 'date-fns'
import { cn } from 'tailwind-variants'

import { ResumeDownloadButton } from '@/blocks/ResumeDownloadsBlock/Renderer/ResumeDownloadButton'
import { PageFallback } from '@/components/PageFallback'
import { ResumeChecksumValidator } from '@/components/ResumeCheckumValidatior/ResumeChecksumValidator'
import { ResumeNewerVersionsChecker } from '@/components/ResumeNewerVersionsChecker'
import { fetchGlobalUserSettingsCached, fetchSiteSettingsCached } from '@/lib/fetchers'
import { fetchDocumentBySlug } from '@/lib/fetchers/fetchDocumentBySlug'
import { generateContentURL } from '@/lib/generateContentURL'
import { JsonLd, resumeDocumentGraph } from '@/lib/jsonLd'
import { ogImageMetadata } from '@/lib/og/ogImageMetadata'
import { placeholderParams } from '@/lib/placeholderParams'
import { resumeDocumentDescription } from '@/lib/resumeDocumentDescription'
import { RESUME_VALIDATE_PATH, RESUME_VALIDATE_SLUG } from '@/lib/routeIndex/buildRouteIndex'
import { isMediaImage } from '@/lib/typeGuards'
import { CollectionSlug } from '@/types/collections'
import { MediaImage } from '@/types/payload'

import { ChecksumEntry, ChecksumRow } from './components/ChecksumFootnote.client'
import { ResumePreviewCarousel, type ResumePreviewPage } from './components/ResumePreviewCarousel'

/**
 * Reserved slug value that resolves to whichever document is actually
 * newest, rather than one fixed row — see `fetchDocumentBySlug`.
 */
const LATEST_RESUME_SLUG = 'latest'

type ThumbnailEntries = {
  relationTo: 'images'
  value: string | MediaImage
}[]

/** The populated page thumbnails of a locale, in page order. */
const populatedThumbnails = (thumbnails: ThumbnailEntries = []): MediaImage[] =>
  thumbnails.flatMap(({ value }) => (isMediaImage(value) ? [value] : []))

const toPreviewPages = (thumbnails: MediaImage[], locale: string): ResumePreviewPage[] =>
  thumbnails.flatMap(({ id, url, blurDataURL }) =>
    url ? [{ id: `${id}-${locale}`, url, blurDataURL }] : [],
  )

export async function generateStaticParams() {
  const payload = await getPayload({
    config,
  })

  const { docs = [] } = await payload.find({
    collection: CollectionSlug.ResumeDocuments,
    draft: false,
    limit: 1000,
    // The collection denies anonymous reads and has no drafts to filter out.
    overrideAccess: true,
    pagination: false,
    select: {
      slug: true,
    },
  })

  if (docs.length === 0) {
    return placeholderParams('/resume/[slug]')
  }

  return [
    {
      slug: LATEST_RESUME_SLUG,
    },
    {
      slug: RESUME_VALIDATE_SLUG,
    },
    ...docs.map(({ slug }) => ({
      slug,
    })),
  ]
}

export default async function ResumeDocumentShell(props: PageProps<'/resume/[slug]'>) {
  return (
    <Suspense fallback={<PageFallback />}>
      <ResumeDocument {...props} />
    </Suspense>
  )
}

/** `/resume/validate`: checks an uploaded PDF against the published checksums. */
const ResumeValidator = () => (
  <section className="bg-background pt-40 pb-16 text-foreground sm:pb-20">
    <div className="container">
      <h1 className="mb-10 font-mono text-2xl font-medium tracking-tight md:mb-12 md:text-3xl">
        Validate a document
      </h1>
      <Suspense
        fallback={<div className="text-sm text-muted-foreground md:text-base">Loading…</div>}
      >
        <ResumeChecksumValidator />
      </Suspense>
    </div>
  </section>
)

async function ResumeDocument({ params }: PageProps<'/resume/[slug]'>) {
  const { slug } = await params

  if (slug === RESUME_VALIDATE_SLUG) return <ResumeValidator />
  const { isEnabled: draft } = await draftMode()

  const isLatestSlug = slug === LATEST_RESUME_SLUG
  const resume = await fetchDocumentBySlug({ slug, draft })

  if (!resume) return notFound()

  const thumbnailsEn = populatedThumbnails(resume.thumbnails_en)
  const thumbnailsDe = populatedThumbnails(resume.thumbnails_de)

  const previewPages = {
    en: toPreviewPages(thumbnailsEn, 'en'),
    de: toPreviewPages(thumbnailsDe, 'de'),
  }

  // oxlint-disable-next-line anti-slop/no-runtime-typeof
  const documentEn = typeof resume.document_en?.value === 'object' ? resume.document_en.value : null
  const documentDe = typeof resume.document_de?.value === 'object' ? resume.document_de.value : null

  const checksumEntries: ChecksumEntry[] = [
    resume.checksum_en && {
      locale: 'en',
      label: 'EN',
      checksum: resume.checksum_en,
    },
    resume.checksum_de && {
      locale: 'de',
      label: 'DE',
      checksum: resume.checksum_de,
    },
  ].filter((entry): entry is ChecksumEntry => Boolean(entry))

  const { name } = await fetchGlobalUserSettingsCached()

  const structuredData = resumeDocumentGraph({
    siteUrl: process.env.SERVER_URL,
    slug: resume.slug,
    title: resume.title,
    description: resumeDocumentDescription(resume.createdAt, name),
    createdAt: resume.createdAt,
    files: [
      {
        language: 'en',
        media: documentEn,
        checksum: resume.checksum_en,
      },
      {
        language: 'de',
        media: documentDe,
        checksum: resume.checksum_de,
      },
    ],
    thumbnail: thumbnailsEn[0] ?? thumbnailsDe[0] ?? null,
  })

  return (
    <div>
      <JsonLd nodes={structuredData} />
      <section
        className={cn([
          'relative overflow-hidden',
          'flex flex-col justify-center',
          'bg-linear-to-b from-purple-500 via-indigo-500 to-background',
        ])}
      >
        <div className="container flex flex-col py-24 sm:py-32 lg:flex-row lg:items-center lg:gap-16 lg:py-30 xl:gap-32 xl:py-40">
          <div className="flex flex-col gap-8 text-primary-foreground lg:w-1/2 lg:gap-10">
            <div>
              <h1 className="font-mono text-3xl font-medium tracking-tight md:text-4xl">
                Resume Document
              </h1>
              {resume.createdAt && (
                <h2 className="font-mono text-lg font-normal opacity-80">
                  {format(new Date(resume.createdAt), 'PP')}
                </h2>
              )}
            </div>

            {/* `latest` is by definition already the newest version — the
                "is this still current" check is meaningless there. */}
            {!isLatestSlug && <ResumeNewerVersionsChecker createdAt={resume.createdAt} />}

            <div className="flex flex-col gap-4 sm:flex-row">
              {documentEn && (
                <div className="flex flex-col gap-1 sm:flex-1">
                  <ResumeDownloadButton
                    locale="en"
                    slug={slug}
                    url={documentEn.url}
                    fileName={documentEn.filename}
                    label="Download"
                    subline="English Version"
                  />
                  {checksumEntries
                    .filter((entry) => entry.locale === 'en')
                    .map((entry) => (
                      <ChecksumRow key={entry.locale} {...entry} />
                    ))}
                </div>
              )}
              {documentDe && (
                <div className="flex flex-col gap-1 sm:flex-1">
                  <ResumeDownloadButton
                    locale="de"
                    slug={slug}
                    url={documentDe.url}
                    fileName={documentDe.filename}
                    label="Download"
                    subline="German Version"
                  />
                  {checksumEntries
                    .filter((entry) => entry.locale === 'de')
                    .map((entry) => (
                      <ChecksumRow key={entry.locale} {...entry} />
                    ))}
                </div>
              )}
            </div>

            <p className="text-sm opacity-80 md:text-base">
              Download the resume in your preferred language above, or check out the{' '}
              <Link href="/resume" className="underline underline-offset-4">
                always up to date web version
              </Link>
              . Want to make sure a PDF you already have hasn't been tampered with? Check it against
              the published checksums with the{' '}
              <Link href={RESUME_VALIDATE_PATH} className="underline underline-offset-4">
                document validator
              </Link>
              .
            </p>
          </div>

          <div className="mt-16 flex justify-center lg:mt-0 lg:w-1/2">
            <ResumePreviewCarousel pages={previewPages} />
          </div>
        </div>
      </section>
    </div>
  )
}

export async function generateMetadata({ params }: PageProps<'/resume/[slug]'>): Promise<Metadata> {
  const { slug } = await params

  if (slug === RESUME_VALIDATE_SLUG) {
    return {
      title: 'Validate a resume document',
      description: 'Check that a resume PDF matches the published checksum of its original.',
      alternates: {
        canonical: new URL(RESUME_VALIDATE_PATH, process.env.SERVER_URL).href,
      },
    }
  }

  const resume = await fetchDocumentBySlug({ slug })

  const {
    general: { siteName },
  } = await fetchSiteSettingsCached()

  const { name, url } = await fetchGlobalUserSettingsCached()

  const title = resume?.title ?? 'Resume'

  const description = resumeDocumentDescription(resume?.createdAt, name)

  return {
    title,
    description,
    alternates: {
      canonical: generateContentURL({
        collection: CollectionSlug.ResumeDocuments,
        slug: resume?.slug,
      }),
    },
    creator: name,
    authors: name
      ? [
          {
            name,
            url,
          },
        ]
      : undefined,
    openGraph: {
      type: 'website',
      title,
      description,
      siteName: siteName ?? undefined,
      images: resume
        ? [
            ogImageMetadata(
              {
                collection: CollectionSlug.ResumeDocuments,
                slug: resume.slug,
              },
              title,
              resume.createdAt,
            ),
          ]
        : undefined,
    },
  }
}
