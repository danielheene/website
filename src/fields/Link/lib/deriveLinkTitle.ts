import { CUSTOM_URL_SLUG, type LinkTarget } from './resolveLinkTarget'

/**
 * Hostname of an absolute URL, or the input unchanged when it has none —
 * `mailto:`, `tel:`, root-relative paths and fragments all parse without a
 * host, and showing the raw string beats showing nothing.
 */
const hostnameOrRaw = (url: string): string => {
  try {
    return new URL(url).hostname || url
  } catch {
    return url
  }
}

/**
 * The value bound to `{title}` when rendering a link label.
 *
 * A reference contributes its document title; a custom URL contributes its
 * hostname. The fallback matters: `label` defaults to `{title}`, so an empty
 * result would silently produce an unlabelled link.
 */
export const deriveLinkTitle = (target: LinkTarget | null): string => {
  if (!target) return ''

  if (target.relationTo === CUSTOM_URL_SLUG) {
    return hostnameOrRaw(target.value)
  }

  const { value } = target

  if (value && typeof value === 'object' && 'title' in value) {
    return typeof value.title === 'string' ? value.title : ''
  }

  return ''
}
