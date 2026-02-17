'use server'

import { GlobalSlug } from '@custom-types'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

export const getResumeDocumentData = async (locale: 'en' | 'de' = 'en') => {
  const payload = await getPayload({ config })

  const sharedOptions = {
    draft: false,
    depth: 10,
    locale,
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

  const userMetaData = await payload.findGlobal({
    slug: GlobalSlug.SettingsUserMeta,
    ...sharedOptions,
  })

  return {
    locale,
    userMetaData,
    aboutMe,
    contact,
    customers,
    downloads,
    experience,
    projects,
  }
}

export const getCachedResumeDocumentData = unstable_cache(getResumeDocumentData, [], {
  tags: [
    GlobalSlug.SettingsUserMeta,
    GlobalSlug.ResumeAboutMe,
    GlobalSlug.ResumeContact,
    GlobalSlug.ResumeCustomers,
    GlobalSlug.ResumeDownloads,
    GlobalSlug.ResumeExperience,
    GlobalSlug.ResumeProjects,
  ],
})
