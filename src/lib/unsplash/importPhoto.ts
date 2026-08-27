'use server'

import config from '@payload-config'
import { getPayload } from 'payload'

import { CollectionSlug } from '@/types/collections'

import { buildCreditsValue } from './buildCreditsValue'
import type { UnsplashApiPhoto } from './types'

const UNSPLASH_API_BASE = 'https://api.unsplash.com'

export interface UnsplashImportResult {
  id: string
  url: string | null
  alt: string | null
  blurDataURL: string | null
}

const unsplashHeaders = (accessKey: string) => ({
  Authorization: `Client-ID ${accessKey}`,
  'Accept-Version': 'v1',
})

/**
 * Fetches full photo detail (needed for `links.download_location`, which
 * search results also carry, but this keeps `importPhoto` independent of
 * exactly what `searchPhotos` passed through).
 */
const fetchPhotoDetail = async (photoId: string, accessKey: string): Promise<UnsplashApiPhoto> => {
  const response = await fetch(`${UNSPLASH_API_BASE}/photos/${photoId}`, {
    headers: unsplashHeaders(accessKey),
  })
  const body = await response.json()

  if (!response.ok) {
    const message = Array.isArray(body?.errors)
      ? body.errors.join(', ')
      : `Failed to load Unsplash photo ${photoId} (${response.status}).`
    throw new Error(message)
  }

  return body as UnsplashApiPhoto
}

/**
 * Unsplash's API guidelines require this ping whenever a photo is used
 * (downloaded/imported), separate from and in addition to fetching the image
 * bytes themselves. It returns the tracked download URL, which is safe to
 * ignore here since the `full` rendition URL already has everything needed.
 */
const triggerDownloadTracking = async (
  downloadLocation: string,
  accessKey: string,
): Promise<void> => {
  const response = await fetch(downloadLocation, {
    headers: unsplashHeaders(accessKey),
  })
  if (!response.ok) {
    throw new Error(`Failed to register Unsplash download (${response.status}).`)
  }
}

const downloadImageBytes = async (
  url: string,
): Promise<{
  data: Buffer
  mimetype: string
}> => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to download the Unsplash image (${response.status}).`)
  }

  const arrayBuffer = await response.arrayBuffer()
  const mimetype = response.headers.get('content-type') ?? 'image/jpeg'

  return {
    data: Buffer.from(arrayBuffer),
    mimetype,
  }
}

/**
 * Imports one Unsplash photo into `MediaImages`: downloads the `full`
 * rendition, fires the required download-tracking ping, and creates a normal
 * media document — attributed and flagged — through Payload's local API so
 * the collection's existing `beforeChange` hooks run exactly as they do for a
 * manual upload.
 */
export const importPhoto = async ({
  photoId,
}: {
  photoId: string
}): Promise<UnsplashImportResult> => {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY
  if (!accessKey) {
    throw new Error('UNSPLASH_ACCESS_KEY is not configured.')
  }

  const photo = await fetchPhotoDetail(photoId, accessKey)
  await triggerDownloadTracking(photo.links.download_location, accessKey)
  const { data, mimetype } = await downloadImageBytes(photo.urls.full)

  const extension = mimetype === 'image/png' ? 'png' : 'jpg'
  const filename = `unsplash-${photo.id}.${extension}`

  const payload = await getPayload({
    config,
  })

  const doc = await payload.create({
    collection: CollectionSlug.MediaImages,
    data: {
      generatorFlags: [
        'unsplash-import',
      ],
      credits: buildCreditsValue({
        photographerName: photo.user.name,
        photographerProfileUrl: photo.user.links.html,
      }),
    },
    file: {
      data,
      name: filename,
      mimetype,
      size: data.byteLength,
    },
  })

  return {
    id: String(doc.id),
    url: doc.url ?? null,
    alt: doc.alt ?? null,
    blurDataURL: doc.blurDataURL ?? null,
  }
}
