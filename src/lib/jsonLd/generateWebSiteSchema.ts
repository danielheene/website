import type { WebSiteLeaf, WithContext } from 'schema-dts'

import { isMediaImage } from '@/lib/typeGuards'
import { GlobalData, GlobalSlug } from '@/types/globals'

/**
 * Generates WebSite JSON-LD
 * @param data
 */
export function generateWebSiteSchema({
  general: data,
}: GlobalData<GlobalSlug['SiteSettings']>): WithContext<WebSiteLeaf> {
  const webSite: WithContext<WebSiteLeaf> = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: data.siteName,
    url: data.siteURL,
  }

  if (data.description) {
    webSite.description = data.description?.replaceAll(/(\r?\n|\r\n?)/g, ' ')
  }

  if (isMediaImage(data.image)) {
    webSite.image = {
      '@type': 'ImageObject',
      url: data.image.url,
    }
  }

  // if (data.searchUrl) {
  //   webSite.potentialAction = {
  //     '@type': 'SearchAction',
  //     target: {
  //       '@type': 'EntryPoint',
  //       urlTemplate: `${data.searchUrl}?q={search_term_string}`,
  //     },
  //     // @ts-expect-error - query-input is valid per Schema.org but not in schema-dts types
  //     'query-input': 'required name=search_term_string',
  //   }
  // }

  return webSite
}
