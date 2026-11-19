import { CollectionSlug } from '@/types/collections'

/**
 * Where the logo endpoint serves a customer's SVG. `updatedAt` versions the
 * URL, so the file can be cached as immutable and a change gets a new URL.
 */
export const customerLogoPath = ({ slug, updatedAt }: { slug: string; updatedAt: string }) =>
  `/api/${CollectionSlug.ResumeCustomers}/${encodeURIComponent(slug)}/logo.svg?v=${encodeURIComponent(updatedAt)}`
