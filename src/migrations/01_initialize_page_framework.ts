import { CollectionSlug, GlobalSlug } from '@custom-types'
import { Page } from '@payload-types'
import { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-mongodb'

export async function up({ payload, req, session }: MigrateUpArgs): Promise<void> {
  const resumeGlobals = [
    { slug: GlobalSlug.ResumeAboutMe, title: 'About Me' },
    { slug: GlobalSlug.ResumeContact, title: 'Contact' },
    { slug: GlobalSlug.ResumeCustomers, title: 'Customers' },
    { slug: GlobalSlug.ResumeDownloads, title: 'Downloads' },
    { slug: GlobalSlug.ResumeExperience, title: 'Experience' },
    { slug: GlobalSlug.ResumeProjects, title: 'Projects' },
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
        _status: 'published',
      },
      req,
    })
  }

  const defaultPages = [
    { title: 'Home', slug: 'home', layout: 'home' },
    { title: 'Resume', slug: 'resume', layout: 'resume' },
    { title: 'About Me', slug: 'about-me', layout: 'default' },
    { title: 'Legal Notice', slug: 'legal-notice', layout: 'default' },
    { title: 'Privacy Policy', slug: 'privacy-policy', layout: 'default' },
  ] as { title: string; slug: string; layout: Page['layout'] }[]

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
      payload.logger.info(`Page with slug ${defaultPage.slug} already exists`)
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
        draft: false,
        req,
      })
    } else {
      payload.logger.info(`Creating page with slug ${defaultPage.slug}`)
      await payload.create({
        collection: CollectionSlug.Pages,
        data: {
          ...defaultPage,
          _status: 'published',
        },
        draft: false,
        req,
      })
    }
  }
}

export async function down({ payload, req, session }: MigrateDownArgs): Promise<void> {
  // Migration code
}
