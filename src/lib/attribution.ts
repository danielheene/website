import {
  ATTRIBUTION_LICENSES,
  isAttributionLicense,
  type AttributionLicense,
} from '@/fields/Attribution/licenses'

export type AttributionCredit = {
  name: string
  url?: string
}

/** The stored `attribution` group, as every media collection carries it. */
export type AttributionValue = {
  authorName?: string | null
  authorURL?: string | null
  studioName?: string | null
  studioURL?: string | null
  license?: string | null
  notes?: unknown
}

export type ResolvedAttribution = {
  author?: AttributionCredit
  studio?: AttributionCredit
  license?: {
    value: AttributionLicense
    label: string
    url?: string
  }
  notes?: unknown
}

const credit = (name?: string | null, url?: string | null): AttributionCredit | undefined => {
  const trimmed = name?.trim()

  if (!trimmed) return undefined

  return url?.trim() ? { name: trimmed, url: url.trim() } : { name: trimmed }
}

/**
 * Payload stores a cleared rich text field as an empty paragraph rather than
 * null, so notes count only when some node carries text.
 */
export const hasLexicalText = (value: unknown): boolean => {
  if (!value || typeof value !== 'object') return false

  const visit = (node: unknown): boolean => {
    if (!node || typeof node !== 'object') return false

    if ('text' in node && typeof node.text === 'string' && node.text.trim() !== '') return true

    return 'children' in node && Array.isArray(node.children) && node.children.some(visit)
  }

  return 'root' in value && visit(value.root)
}

/** The attribution's displayable parts, or null when it credits nobody. */
export const resolveAttribution = (
  value: AttributionValue | null | undefined,
): ResolvedAttribution | null => {
  if (!value) return null

  const author = credit(value.authorName, value.authorURL)
  const studio = credit(value.studioName, value.studioURL)
  const notes = hasLexicalText(value.notes) ? value.notes : undefined

  // a license alone credits nobody, so it does not make an attribution
  if (!author && !studio && !notes) return null

  const license = isAttributionLicense(value.license)
    ? { value: value.license, ...ATTRIBUTION_LICENSES[value.license] }
    : undefined

  return {
    ...(author && { author }),
    ...(studio && { studio }),
    ...(license && { license }),
    ...(notes && { notes }),
  }
}

/** One line of text, e.g. "Jane Doe / Unsplash", for structured data. */
export const attributionText = (attribution: ResolvedAttribution): string | undefined =>
  [attribution.author?.name, attribution.studio?.name].filter(Boolean).join(' / ') || undefined
