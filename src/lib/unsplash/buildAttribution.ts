import { AttributionLicense } from '@/fields/Attribution/licenses'
import type { AttributionValue } from '@/lib/attribution'

/**
 * Unsplash's API guidelines require crediting the photographer and Unsplash,
 * each linking back with the app's UTM params attached
 * (https://help.unsplash.com/en/articles/2511315).
 */
const UTM_PARAMS = 'utm_source=heene_io&utm_medium=referral'

/** The `attribution` value for an imported Unsplash photo. */
export const buildUnsplashAttribution = ({
  photographerName,
  photographerProfileUrl,
}: {
  photographerName: string
  photographerProfileUrl: string
}) =>
  ({
    authorName: photographerName,
    authorURL: `${photographerProfileUrl}?${UTM_PARAMS}`,
    studioName: 'Unsplash',
    studioURL: `https://unsplash.com/?${UTM_PARAMS}`,
    license: AttributionLicense.Unsplash,
  }) satisfies AttributionValue
