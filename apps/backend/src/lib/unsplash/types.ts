export interface UnsplashSearchResult {
  id: string
  thumbUrl: string
  description: string
  photographerName: string
  photographerProfileUrl: string
  width: number
  height: number
}

export interface UnsplashSearchResponse {
  results: UnsplashSearchResult[]
  total: number
  totalPages: number
}

/**
 * Raw shape of a single entry in Unsplash's `GET /search/photos` response.
 * Only the fields this app reads are declared.
 */
export interface UnsplashApiPhoto {
  id: string
  description: string | null
  alt_description: string | null
  width: number
  height: number
  urls: {
    full: string
    thumb: string
  }
  links: {
    download_location: string
  }
  user: {
    name: string
    links: {
      html: string
    }
  }
}

export interface UnsplashApiSearchResponse {
  total: number
  total_pages: number
  results: UnsplashApiPhoto[]
}
