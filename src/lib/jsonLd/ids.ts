/**
 * Stable `@id`s for the nodes every page's graph links to, so the same person,
 * site and blog are one entity across the whole site rather than a copy per
 * page.
 */
export const jsonLdIds = (siteUrl: string) => {
  const base = siteUrl.replace(/\/$/, '')

  return {
    person: `${base}/#person`,
    website: `${base}/#website`,
    blog: `${base}/blog#blog`,
  }
}

export const webPageId = (url: string) => `${url}#webpage`

export const breadcrumbId = (url: string) => `${url}#breadcrumb`

/** A pixel dimension; schema.org takes lengths as a distance or a quantity, not a bare number. */
export const pixels = (value: number) => ({
  '@type': 'QuantitativeValue' as const,
  value,
  unitCode: 'E37',
  unitText: 'px',
})

/** Resolves a media URL, which Payload stores relative to the site, to an absolute one. */
export const absoluteUrl = (url: string, siteUrl: string) => new URL(url, siteUrl).href
