'use server'

import { getCachedSiteConfigurationData } from '@/lib/getSiteConfigurationData'

export const generateMetaTitle = async (title: string) => {
  const { titleTemplate, siteName, siteUrl } =
    await getCachedSiteConfigurationData()

  return titleTemplate
    .replaceAll('{siteName}', siteName)
    .replaceAll('{siteUrl}', siteUrl)
    .replaceAll('{title}', title)
    .trim()
}
