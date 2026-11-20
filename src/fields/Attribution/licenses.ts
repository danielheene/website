export const AttributionLicense = {
  AllRightsReserved: 'all-rights-reserved',
  OwnWork: 'own-work',
  Unsplash: 'unsplash',
  Pexels: 'pexels',
  Pixabay: 'pixabay',
  PublicDomain: 'public-domain',
  CC0: 'cc0-1.0',
  CCBY: 'cc-by-4.0',
  CCBYSA: 'cc-by-sa-4.0',
  CCBYND: 'cc-by-nd-4.0',
  CCBYNC: 'cc-by-nc-4.0',
  CCBYNCSA: 'cc-by-nc-sa-4.0',
  CCBYNCND: 'cc-by-nc-nd-4.0',
  MIT: 'mit',
  OFL: 'ofl-1.1',
  RoyaltyFree: 'royalty-free',
  Other: 'other',
} as const

export type AttributionLicense = (typeof AttributionLicense)[keyof typeof AttributionLicense]

type LicenseInfo = {
  label: string
  /** The license text, linked wherever the license is shown. */
  url?: string
}

export const ATTRIBUTION_LICENSES: Record<AttributionLicense, LicenseInfo> = {
  [AttributionLicense.AllRightsReserved]: {
    label: 'All rights reserved',
  },
  [AttributionLicense.OwnWork]: {
    label: 'Own work',
  },
  [AttributionLicense.Unsplash]: {
    label: 'Unsplash License',
    url: 'https://unsplash.com/license',
  },
  [AttributionLicense.Pexels]: {
    label: 'Pexels License',
    url: 'https://www.pexels.com/license/',
  },
  [AttributionLicense.Pixabay]: {
    label: 'Pixabay Content License',
    url: 'https://pixabay.com/service/license-summary/',
  },
  [AttributionLicense.PublicDomain]: {
    label: 'Public domain',
    url: 'https://creativecommons.org/publicdomain/mark/1.0/',
  },
  [AttributionLicense.CC0]: {
    label: 'CC0 1.0',
    url: 'https://creativecommons.org/publicdomain/zero/1.0/',
  },
  [AttributionLicense.CCBY]: {
    label: 'CC BY 4.0',
    url: 'https://creativecommons.org/licenses/by/4.0/',
  },
  [AttributionLicense.CCBYSA]: {
    label: 'CC BY-SA 4.0',
    url: 'https://creativecommons.org/licenses/by-sa/4.0/',
  },
  [AttributionLicense.CCBYND]: {
    label: 'CC BY-ND 4.0',
    url: 'https://creativecommons.org/licenses/by-nd/4.0/',
  },
  [AttributionLicense.CCBYNC]: {
    label: 'CC BY-NC 4.0',
    url: 'https://creativecommons.org/licenses/by-nc/4.0/',
  },
  [AttributionLicense.CCBYNCSA]: {
    label: 'CC BY-NC-SA 4.0',
    url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
  },
  [AttributionLicense.CCBYNCND]: {
    label: 'CC BY-NC-ND 4.0',
    url: 'https://creativecommons.org/licenses/by-nc-nd/4.0/',
  },
  [AttributionLicense.MIT]: {
    label: 'MIT License',
    url: 'https://opensource.org/license/mit',
  },
  [AttributionLicense.OFL]: {
    label: 'SIL Open Font License 1.1',
    url: 'https://openfontlicense.org/',
  },
  [AttributionLicense.RoyaltyFree]: {
    label: 'Royalty-free (licensed stock)',
  },
  [AttributionLicense.Other]: {
    label: 'Other (see notes)',
  },
}

export const isAttributionLicense = (value: unknown): value is AttributionLicense =>
  typeof value === 'string' && Object.hasOwn(ATTRIBUTION_LICENSES, value)
