'use server'

import { fetchGlobalData } from '@/lib/fetchers/fetchGlobalData'
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
 * @returns {Promise<GlobalData<GlobalSlug['SiteSettings']>>} A promise that resolves to the global site configuration data reduced to the specified locale.
 * @throws {Error} May throw an error if the Payload CMS instance cannot be initialized or the global data cannot be fetched.
 */
export const getSiteSettings = async (locale: Locale = 'en') => {
  const data = await fetchGlobalData(GlobalSlug['SiteSettings'])

  return reduceDataToLocale(data, locale)
}
