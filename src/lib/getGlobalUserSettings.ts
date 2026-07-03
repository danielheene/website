'use server'

import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

import { type Locale, reduceDataToLocale } from '@/lib/i18n'
import { type GlobalData, GlobalSlug } from '@/types/globals'

/**
 * Retrieves user configuration settings data for a specified locale.
 *
 * Fetches the global user configuration settings from the payload system and reduces
 * the data to match the requested locale. This function provides access to application-wide
 * user configuration settings that are stored as a global singleton.
 *
 * @async
 * @param {Locale} locale - The locale identifier for which to retrieve the configuration data. Defaults to 'en'.
 * @returns {Promise<GlobalData<GlobalSlug['SettingsUserConfiguration']>>} A promise that resolves to the user configuration data localized to the specified locale.
 * @throws {Error} May throw an error if the Payload CMS instance cannot be initialized or the global data cannot be fetched.
 */
export const getUserConfigurationData = async (
  locale: Locale = 'en',
): Promise<GlobalData<GlobalSlug['SettingsUserConfiguration']>> => {
  const payload = await getPayload({
    config,
  })

  const data = await payload.findGlobal({
    slug: GlobalSlug.SettingsUserConfiguration,
    draft: false,
  })

  return reduceDataToLocale(data, locale)
}

/**
 * Cached version of the user configuration data retrieval function.
 *
 * This function wraps the getUserConfigurationData function with caching capabilities
 * to improve performance by avoiding redundant database or API calls for user configuration data.
 * The cache is tagged with the GlobalSlug.SettingsUserConfiguration identifier, allowing
 * for targeted cache invalidation when user configuration settings are updated.
 *
 * @constant
 * @type {Function}
 * @returns {Promise<GlobalData<GlobalSlug['SettingsUserConfiguration']>>} A promise that resolves to the user configuration data
 */
export const getCachedUserConfigurationData = unstable_cache(
  getUserConfigurationData,
  [],
  {
    tags: [
      GlobalSlug.SettingsUserConfiguration,
    ],
  },
)
