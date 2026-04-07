import { generateContentPath } from './generateContentPath'

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

/**
 * Generates a content URL based on the collection, slug, and params
 * @param collection
 * @param slug
 * @param params
 * @param path
 */
export const generateContentURL = ({ collection, slug, params, path }: GenerateContentURLProps): string => {
  const urlPath = encodeURI(path || generateContentPath(collection, slug))
  const urlParams = params ? `?${new URLSearchParams(params).toString()}` : ''

  return new URL(`${urlPath}${urlParams}`, process.env.NEXT_PUBLIC_SERVER_URL).toString()
}
