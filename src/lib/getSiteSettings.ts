'use server'

import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

import { type Locale, reduceDataToLocale } from '@/lib/i18n'
import { type GlobalData, GlobalSlug } from '@/types/globals'

/**
 * Retrieves the site configuration data from the CMS for a specified locale.
 *
 * This function fetches global site configuration settings by querying the Payload CMS
 * using the SiteSettings global slug. It retrieves only published (non-draft)
 * content and reduces the returned data to match the requested locale.
 *
 * @async
 * @param {Locale} locale - The locale identifier for which to retrieve the configuration data. Defaults to 'en'.
 * @returns {Promise<GlobalData<GlobalSlug.SiteSettings>>} A promise that resolves to the global site configuration data reduced to the specified locale.
 * @throws {Error} May throw an error if the Payload CMS instance cannot be initialized or the global data cannot be fetched.
 */
export const getSiteSettings = async (
  locale: Locale = 'en',
): Promise<GlobalData<GlobalSlug.SiteSettings>> => {
  const payload = await getPayload({
    config,
  })

  const data = await payload.findGlobal({
    slug: GlobalSlug.SiteSettings,
    draft: false,
  })

  return reduceDataToLocale(data, locale)
}

/**
 * Cached version of the site configuration data retrieval function.
 *
 * This function wraps the getSiteSettings function with caching capabilities
 * to improve performance by avoiding redundant database or API calls for site configuration data.
 * The cache is tagged with the GlobalSlug.SiteSettings identifier, allowing
 * for targeted cache invalidation when site configuration settings are updated.
 *
 * @constant
 * @type {Function}
 * @returns {Promise<GlobalData<GlobalSlug.SiteSettings>>} A promise that resolves to the site configuration data
 */
export const getCachedSiteSettings = unstable_cache(
  getSiteSettings,
  [],
  {
    tags: [
      GlobalSlug.SiteSettings,
    ],
  },
)
