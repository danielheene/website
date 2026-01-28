import type { WebSite, WithContext } from 'schema-dts'

export interface WebSiteData {
  name: string
  url: string
  description?: string
  searchUrl?: string
}

export function generateWebSite(data: WebSiteData): WithContext<WebSite> {
  const webSite: WithContext<WebSite> = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: data.name,
    url: data.url,
  }

  if (data.description) {
    webSite.description = data.description
  }

  if (data.searchUrl) {
    webSite.potentialAction = {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${data.searchUrl}?q={search_term_string}`,
      },
      // @ts-expect-error - query-input is valid per Schema.org but not in schema-dts types
      'query-input': 'required name=search_term_string',
    }
  }

  return webSite
}
