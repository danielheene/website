import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-mongodb'

import { CollectionSlug } from '@/types/collections'
import { GlobalSlug } from '@/types/globals'
import type { Page } from '@/types/payload'

export async function up({
  payload,
  req,
  session,
}: MigrateUpArgs): Promise<void> {
  const resumeGlobals = [
    {
      slug: GlobalSlug.ResumeAboutMe,
      title: 'About Me',
    },
    {
      slug: GlobalSlug.ResumeContact,
      title: 'Contact',
    },
    {
      slug: GlobalSlug.ResumeCustomers,
      title: 'Customers',
    },
    {
      slug: GlobalSlug.ResumeDownloads,
      title: 'Downloads',
    },
    {
      slug: GlobalSlug.ResumeExperience,
      title: 'Experience',
    },
    {
      slug: GlobalSlug.ResumeProjects,
      title: 'Projects',
    },
  ] as {
    slug:
      | GlobalSlug.ResumeAboutMe
      | GlobalSlug.ResumeContact
      | GlobalSlug.ResumeCustomers
      | GlobalSlug.ResumeDownloads
      | GlobalSlug.ResumeExperience
      | GlobalSlug.ResumeProjects
    title: string
  }[]

  for (const resumeGlobal of resumeGlobals) {
    await payload.updateGlobal({
      slug: resumeGlobal.slug,
      data: {
        title: resumeGlobal.title,
      },
      context: {
        skipRevalidate: true,
      },
      req,
    })
    payload.logger.info(`Global: ${resumeGlobal.slug} updated successfully`)
  }

  const defaultPages = [
    {
      title: 'Home',
      slug: 'home',
      layout: 'home',
    },
    {
      title: 'Resume',
      slug: 'resume',
      layout: 'resume',
    },
    {
      title: 'About Me',
      slug: 'about-me',
      layout: 'default',
    },
    {
      title: 'Legal Notice',
      slug: 'legal-notice',
      layout: 'default',
    },
    {
      title: 'Privacy Policy',
      slug: 'privacy-policy',
      layout: 'default',
    },
  ] as {
    title: string
    slug: string
    layout: Page['layout']
  }[]

  for (const defaultPage of defaultPages) {
    const { docs } = await payload.find({
      collection: CollectionSlug.Pages,
      where: {
        slug: {
          equals: defaultPage.slug,
        },
      },
      req,
    })

    if (docs.length) {
      payload.logger.info(
        `Page: ${defaultPage.slug} already exists, updating...`,
      )
      await payload.update({
        collection: CollectionSlug.Pages,
        where: {
          slug: {
            equals: defaultPage.slug,
          },
        },
        data: {
          title: defaultPage.title,
          layout: defaultPage.layout,
          _status: 'published',
        },
        context: {
          skipRevalidate: true,
        },
        draft: false,
        req,
      })
      payload.logger.info(`Page: ${defaultPage.slug} updated successfully`)
    } else {
      payload.logger.info(
        `Page: ${defaultPage.slug} does not exist, creating...`,
      )
      await payload.create({
        collection: CollectionSlug.Pages,
        data: {
          ...defaultPage,
          _status: 'published',
        },
        context: {
          skipRevalidate: true,
        },
        draft: false,
        req,
      })
      payload.logger.info(`Page: ${defaultPage.slug} created successfully`)
    }
  }
}

export async function down({ req, session }: MigrateDownArgs): Promise<void> {
  // Migration code
}
