'use server'

import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

import { type Locale, reduceDataToLocale } from '@/lib/i18n'
import { type CollectionData, CollectionSlug } from '@/types/collections'

/**
 * Retrieves all published jobs from the resume jobs collection and returns them localized to the specified locale.
 *
 * This function fetches job data from the Payload CMS, filters for published entries only, and reduces the results
 * to match the requested locale. Pagination is disabled to retrieve all matching records in a single request.
 *
 * @async
 * @param {Locale} locale - The locale identifier for which to retrieve the configuration data. Defaults to 'en'.
 * @returns {Promise<CollectionData<CollectionSlug.ResumeJobs>[]>} A promise that resolves to the localized jobs collection data.
 * @throws {Error} May throw an error if the Payload CMS instance cannot be initialized or the collection query fails.
 */
export const getJobsCollectionData = async (
  locale: Locale = 'en',
): Promise<CollectionData<CollectionSlug.ResumeJobs>[]> => {
  const payload = await getPayload({
    config,
  })

  const { docs } = await payload.find({
    collection: CollectionSlug.ResumeJobs,
    pagination: false,
    where: {
      _status: {
        equals: 'published',
      },
    },
  })

  return reduceDataToLocale(docs, locale)
}

/**
 * Cached version of the jobs collection data retrieval function.
 *
 * This function wraps the getJobsCollectionData function with caching capabilities
 * to improve performance by avoiding redundant database or API calls for jobs collection data.
 * The cache is tagged with the CollectionSlug.ResumeJobs identifier, allowing
 * for targeted cache invalidation when jobs collection settings are updated.
 *
 * @constant
 * @type {Function}
 * @returns {Promise<CollectionData<CollectionSlug.ResumeJobs>[]>} A promise that resolves to the jobs collection data
 */
export const getCachedJobsCollectionData = unstable_cache(
  getJobsCollectionData,
  [],
  {
    tags: [
      CollectionSlug.ResumeJobs,
    ],
  },
)
