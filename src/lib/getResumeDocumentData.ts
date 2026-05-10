'use server'

import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

import { reduceDataToLocale } from '@/lib/reduceDataToLocale'
import { GlobalSlug } from '@/types/globals'

export const getResumeDocumentData = async (locale: 'en' | 'de' = 'en') => {
  const payload = await getPayload({
    config,
  })

  const sharedOptions = {
    draft: false,
    depth: 10,
  }

  const aboutMe = await payload.findGlobal({
    slug: GlobalSlug.ResumeAboutMe,
    ...sharedOptions,
  })

  const contact = await payload.findGlobal({
    slug: GlobalSlug.ResumeContact,
    ...sharedOptions,
  })

  const customers = await payload.findGlobal({
    slug: GlobalSlug.ResumeCustomers,
    ...sharedOptions,
  })

  const downloads = await payload.findGlobal({
    slug: GlobalSlug.ResumeDownloads,
    ...sharedOptions,
  })

  const experience = await payload.findGlobal({
    slug: GlobalSlug.ResumeExperience,
    ...sharedOptions,
  })

  const projects = await payload.findGlobal({
    slug: GlobalSlug.ResumeProjects,
    ...sharedOptions,
  })

  const userConfigurationData = await payload.findGlobal({
    slug: GlobalSlug.SettingsUserConfiguration,
    ...sharedOptions,
  })

  const rawData = {
    locale,
    userConfigurationData,
    aboutMe,
    contact,
    customers,
    downloads,
    experience,
    projects,
  }

  const localizedData = reduceDataToLocale(rawData, locale)
  console.log('localizedData', localizedData)
  return localizedData
}

export const getCachedResumeDocumentData = unstable_cache(
  getResumeDocumentData,
  [],
  {
    tags: [
      GlobalSlug.SettingsUserConfiguration,
      GlobalSlug.ResumeAboutMe,
      GlobalSlug.ResumeContact,
      GlobalSlug.ResumeCustomers,
      GlobalSlug.ResumeDownloads,
      GlobalSlug.ResumeExperience,
      GlobalSlug.ResumeProjects,
    ],
  },
)
