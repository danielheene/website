import { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-mongodb'

import { SiteSettingsDefaults } from '@/globals/SiteSettings'
import { CollectionSlug } from '@/types/collections'
import { GlobalSlug } from '@/types/globals'
import { Page } from '@/types/payload'

export async function up({ payload, req, session }: MigrateUpArgs): Promise<void> {
  // Migration code
  const pages: Record<string, Page> = {}

  const homePage = await payload.create({
    collection: CollectionSlug.Pages,
    data: {
      title: 'Home',
      slug: 'home',
      protected: true,
      layout: 'home',
      _status: 'published',
    },
    draft: false,
  })

  const aboutMePage = await payload.create({
    collection: CollectionSlug.Pages,
    data: {
      title: 'About Me',
      slug: 'about-me',
      protected: true,
      layout: 'default',
      _status: 'published',
    },
    draft: false,
  })

  const resumePage = await payload.create({
    collection: CollectionSlug.Pages,
    data: {
      title: 'Resume',
      slug: 'resume',
      protected: true,
      layout: 'resume',
      _status: 'published',
    },
    draft: false,
  })

  const legalNoticePage = await payload.create({
    collection: CollectionSlug.Pages,
    data: {
      title: 'Legal Notice',
      slug: 'legal-notice',
      protected: true,
      layout: 'legal',
      _status: 'published',
    },
    draft: false,
  })

  const privacyPolicyPage = await payload.create({
    collection: CollectionSlug.Pages,
    data: {
      title: 'Privacy Policy',
      slug: 'privacy-policy',
      protected: true,
      layout: 'resume',
      _status: 'published',
    },
    draft: false,
  })

  const settings = await payload.updateGlobal({
    slug: GlobalSlug.SiteSettings,
    data: {
      general: {
        ...SiteSettingsDefaults.general,
      },
      header: {
        mainNavigation: {
          entries: [
            {
              linkType: 'internal',
              label: resumePage.title,
              doc: {
                relationTo: CollectionSlug.Pages,
                value: resumePage.id,
              },
            },
            {
              linkType: 'internal',
              label: aboutMePage.title,
              doc: {
                relationTo: CollectionSlug.Pages,
                value: aboutMePage.id,
              },
            },
          ],
        },
      },
      footer: {
        column1: {
          isActive: true,
          title: 'General',
          entries: [
            {
              linkType: 'internal',
              label: homePage.title,
              doc: {
                relationTo: CollectionSlug.Pages,
                value: homePage.id,
              },
            },
            {
              linkType: 'internal',
              label: aboutMePage.title,
              doc: {
                relationTo: CollectionSlug.Pages,
                value: aboutMePage.id,
              },
            },
          ],
        },
        column2: {
          isActive: true,
          title: 'Blog',
          entries: [
            {
              linkType: 'custom',
              label: 'All Posts',
              url: '/blog',
            },
            {
              linkType: 'custom',
              label: 'All Topics',
              url: '/blog/topics',
            },
          ],
        },
        column3: {
          isActive: true,
          title: 'Resume',
          entries: [
            {
              linkType: 'internal',
              label: 'Resume Page',
              doc: {
                relationTo: CollectionSlug.Pages,
                value: resumePage.id,
              },
            },
            {
              linkType: 'custom',
              label: 'Download PDF',
              url: '/resume/latest',
            },
          ],
        },
        legalPages: {
          entries: [
            {
              linkType: 'internal',
              label: legalNoticePage.title,
              doc: {
                relationTo: CollectionSlug.Pages,
                value: legalNoticePage.id,
              },
            },
            {
              linkType: 'internal',
              label: privacyPolicyPage.title,
              doc: {
                relationTo: CollectionSlug.Pages,
                value: privacyPolicyPage.id,
              },
            },
          ],
        },
      },
    },
  })
}

export async function down({ payload, req, session }: MigrateDownArgs): Promise<void> {
  // Migration code
}
