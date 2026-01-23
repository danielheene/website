import { COLLECTION_PREFIX_MAP } from '@custom-types'

export const generateContentPath = (collection: string, slug: string = ''): string => {
  const path = [COLLECTION_PREFIX_MAP[collection], slug]

  return path.reduce((acc, curr) => {
    if (typeof curr === 'string' && curr !== '' && curr !== '/' && curr !== 'home') {
      return `${acc}/${curr}`
    } else {
      return acc
    }
  }, '')
}

type GenerateContentURLProps =
  | {
      collection: string
      slug?: string
      path?: never
      params?: Record<string, string> | URLSearchParams
    }
  | {
      collection?: never
      slug?: never
      path: string
      params?: Record<string, string> | URLSearchParams
    }

export const generateContentURL = ({ collection, slug, params, path }: GenerateContentURLProps): URL => {
  const urlPath = path || generateContentPath(collection, slug)
  const urlParams = params ? `?${new URLSearchParams(params).toString()}` : ''

  return new URL(`${urlPath}${urlParams}`, process.env.NEXT_PUBLIC_SERVER_URL)
}
