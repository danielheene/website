'use server'

import { fetchGlobalData } from '@/lib/fetchers/fetchGlobalData'
import { type Locale, reduceDataToLocale } from '@/lib/i18n'
import {  GlobalData, GlobalSlug } from '@/types/globals'

/**
 * Retrieves user configuration settings data for a specified locale.
 *
 * Fetches the global user configuration settings from the payload system and reduces
 * the data to match the requested locale. This function provides access to application-wide
 * user configuration settings that are stored as a global singleton.
 *
 * @async
 * @param {Locale} locale - The locale identifier for which to retrieve the configuration data. Defaults to 'en'.
 * @returns {Promise<GlobalData<GlobalSlug['GlobalUserSettings']>>} A promise that resolves to the user configuration data localized to the specified locale.
 * @throws {Error} May throw an error if the Payload CMS instance cannot be initialized or the global data cannot be fetched.
 */
export const getGlobalUserSettings = async (locale: Locale = 'en'): Promise<GlobalData<GlobalSlug['GlobalUserSettings']>> => {
  const data = await fetchGlobalData(GlobalSlug['GlobalUserSettings'])
  return reduceDataToLocale(data, locale)
}
