import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import config from '@payload-config'
import { getPayload } from 'payload'

import { format } from 'date-fns'
import { cn } from 'tailwind-variants'

import { ResumeDownloadButton } from '@/blocks/ResumeDownloadsBlock/Renderer/ResumeDownloadButton'
import type { HeroMediaItem } from '@/components/HeroMedia/HeroSlide'
import { ResumeChecksumValidator } from '@/components/ResumeCheckumValidatior/ResumeChecksumValidator'
import { ResumeNewerVersionsChecker } from '@/components/ResumeNewerVersionsChecker'
import { fetchGlobalUserSettingsCached, fetchSiteSettingsCached } from '@/lib/fetchers'
import { fetchLatestResumeDocument } from '@/lib/fetchers/fetchLatestResumeDocument'
import { fetchResumeDocumentBySlug } from '@/lib/fetchers/fetchResumeDocumentBySlug'
import { placeholderParams } from '@/lib/placeholderParams'
import { CollectionSlug } from '@/types/collections'
import { MediaImage } from '@/types/payload'

import { ChecksumEntry, ChecksumRow } from './components/ChecksumFootnote.client'
import { ResumePreviewCarousel } from './components/ResumePreviewCarousel'

/** Anchor id for the checksum-validation section, linked from the caption above the fold. */
const validateAnchorId = 'validate'

/**
 * Reserved slug value that resolves to whichever document is actually
 * newest, rather than one fixed row — see `resolveResumeDocument`.
 */
const LATEST_RESUME_SLUG = 'latest'

/**
 * Resolves the `[slug]` param to a document: `fetchLatestResumeDocument()`
 * for the reserved `latest` value (a single KV-cached lookup, no query
 * against a stale slug), `fetchResumeDocumentBySlug()` for every other
 * value. `proxy.ts` used to rewrite `/resume/latest` to the real slug before
 * this route ever ran; that rewrite is gone, so `latest` now reaches here
 * directly and is handled the same way `opengraph-image.tsx` needs it to be.
 */
export const resolveResumeDocument = async (slug: string) =>
  slug === LATEST_RESUME_SLUG ? fetchLatestResumeDocument() : fetchResumeDocumentBySlug(slug)

/** First populated thumbnail for a locale, or `null` if that set is empty/unpopulated. */
const firstThumbnail = (
  thumbnails: {
    relationTo: 'images'
    value: string | MediaImage
  }[] = [],
): MediaImage | null => {
  const populated = thumbnails.find((thumbnail) => typeof thumbnail.value === 'object')
  return (populated?.value as MediaImage | undefined) ?? null
}

export default async function ResumeDocumentPage({ params }: PageProps<'/resume/[slug]'>) {
  const { slug } = await params

  const isLatestSlug = slug === LATEST_RESUME_SLUG
  const resume = await resolveResumeDocument(slug)
  if (!resume) return notFound()

  const thumbnailEn = firstThumbnail(resume.thumbnails_en)
  const thumbnailDe = firstThumbnail(resume.thumbnails_de)

  // Cross-fades between both locales' previews when both exist; falls back
  // to whichever single one is populated, or nothing (the white placeholder
  // stays bare) when neither is.
  const previewItemsOrGaps: (HeroMediaItem | null)[] = [
    thumbnailEn
      ? {
          kind: 'image' as const,
          id: `${thumbnailEn.id}-en`,
          url: thumbnailEn.url,
          alt: '',
          blurDataURL: thumbnailEn.blurDataURL,
        }
      : null,
    thumbnailDe
      ? {
          kind: 'image' as const,
          id: `${thumbnailDe.id}-de`,
          url: thumbnailDe.url,
          alt: '',
          blurDataURL: thumbnailDe.blurDataURL,
        }
      : null,
  ]
  const previewItems: HeroMediaItem[] = previewItemsOrGaps.filter(
    (item): item is HeroMediaItem => item !== null,
  )

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

  return (
    <div>
      <section
        className={cn([
          'relative overflow-hidden',
          'flex flex-col justify-center',
          'bg-linear-to-b from-purple-500 via-indigo-500 to-background',
        ])}
      >
        <div className="container flex flex-col py-24 sm:py-32 lg:flex-row lg:items-center lg:gap-16 xl:gap-32 lg:py-30 xl:py-40">
          <div className="flex flex-col lg:gap-10 text-primary-foreground lg:w-1/2">
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
              . Want to make sure a PDF you already have hasn't been tampered with?{' '}
              <a href={`#${validateAnchorId}`} className="underline underline-offset-4">
                Validate it below
              </a>
              .
            </p>
          </div>

          <div className="flex justify-center lg:w-1/2 lg:justify-end">
            <div
              className={cn([
                'aspect-210/297 h-[45svh] w-auto max-w-full sm:h-[55svh] lg:h-[60svh]',
                'bg-white overflow-hidden shadow-2xl shadow-black/40 relative',
              ])}
            >
              {previewItems.length > 0 && <ResumePreviewCarousel items={previewItems} />}
            </div>
          </div>
        </div>
      </section>
      <section id={validateAnchorId} className="bg-background py-16 text-foreground sm:py-20">
        <div className="container">
          <h2 className="mb-10 font-mono text-2xl font-medium tracking-tight md:mb-12 md:text-3xl">
            Validate a document
          </h2>
          <Suspense
            fallback={<div className="text-sm text-muted-foreground md:text-base">Loading…</div>}
          >
            <ResumeChecksumValidator />
          </Suspense>
        </div>
      </section>
    </div>
  )
}

export async function generateStaticParams() {
  const payload = await getPayload({
    config,
  })

  const { docs = [] } = await payload.find({
    collection: CollectionSlug.ResumeDocuments,
    draft: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  if (docs.length === 0) {
    return placeholderParams('/resume/[slug]')
  }

  // `latest` used to be handled entirely by proxy.ts rewriting it to the
  // real slug before this route ever ran; that rewrite is gone, so it needs
  // its own static param now — resolveResumeDocument gives it real content
  // via fetchLatestResumeDocument rather than a document literally slugged
  // 'latest'.
  return [
    {
      slug: LATEST_RESUME_SLUG,
    },
    ...docs.map(({ slug }) => ({
      slug,
    })),
  ]
}

export async function generateMetadata({ params }: PageProps<'/resume/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  const resume = await resolveResumeDocument(slug)

  const {
    general: { siteName },
  } = await fetchSiteSettingsCached()
  const { name, url } = await fetchGlobalUserSettingsCached()

  const title = resume?.title ?? 'Resume'
  const description = resume?.createdAt
    ? `Resume document generated on ${format(new Date(resume.createdAt), 'PP')}${
        name ? ` by ${name}` : ''
      }. Download the PDF or validate a copy's checksum.`
    : `Resume document${name ? ` by ${name}` : ''}. Download the PDF or validate a copy's checksum.`

  return {
    title,
    description,
    creator: name,
    authors: name
      ? [
          {
            name,
            url,
          },
        ]
      : undefined,
    // `images` is deliberately omitted: Next auto-discovers this route's
    // sibling opengraph-image.tsx and infers its URL.
    openGraph: {
      type: 'website',
      title,
      description,
      siteName: siteName ?? undefined,
    },
  }
}
