'use server'

import type { UnsplashApiSearchResponse, UnsplashSearchResponse } from './types'

const UNSPLASH_API_BASE = 'https://api.unsplash.com'

/**
 * Searches Unsplash's photo library.
 *
 * Requires `UNSPLASH_ACCESS_KEY`, which is optional at the environment-schema
 * level (the feature is hidden in the admin UI when unset) — so this throws
 * rather than silently returning no results if it's called anyway.
 */
export const searchPhotos = async ({
  query,
  page,
}: {
  query: string
  page: number
}): Promise<UnsplashSearchResponse> => {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY
  if (!accessKey) {
    throw new Error('UNSPLASH_ACCESS_KEY is not configured.')
  }

  const url = new URL('/search/photos', UNSPLASH_API_BASE)
  url.searchParams.set('query', query)
  url.searchParams.set('page', String(page))
  url.searchParams.set('per_page', '20')

  const response = await fetch(url, {
    headers: {
      Authorization: `Client-ID ${accessKey}`,
      'Accept-Version': 'v1',
    },
  })

  const body = await response.json()

  if (!response.ok) {
    const message = Array.isArray(body?.errors)
      ? body.errors.join(', ')
      : `Unsplash search failed (${response.status}).`
    throw new Error(message)
  }

  const data = body as UnsplashApiSearchResponse

  return {
    total: data.total,
    totalPages: data.total_pages,
    results: data.results.map((photo) => ({
      id: photo.id,
      thumbUrl: photo.urls.thumb,
      description: photo.alt_description ?? photo.description ?? '',
      photographerName: photo.user.name,
      photographerProfileUrl: photo.user.links.html,
      width: photo.width,
      height: photo.height,
    })),
  }
}
