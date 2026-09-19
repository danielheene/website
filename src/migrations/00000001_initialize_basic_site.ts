import { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-mongodb'

import { SiteSettingsDefaults } from '@/globals/SiteSettings'
import { CollectionSlug } from '@/types/collections'
import { GlobalSlug } from '@/types/globals'

export async function up({ payload, req: _req, session: _session }: MigrateUpArgs): Promise<void> {
  const homePage = await payload.db.upsert({
    collection: CollectionSlug.Pages,
    where: {
      slug: {
        equals: 'home',
      },
    },
    data: {
      title: 'Home',
      slug: 'home',
      protected: true,
      layout: 'home',
      _status: 'published',
    },
  })

  const aboutMePage = await payload.db.upsert({
    collection: CollectionSlug.Pages,
    where: {
      slug: {
        equals: 'about-me',
      },
    },
    data: {
      title: 'About Me',
      slug: 'about-me',
      protected: true,
      layout: 'default',
      _status: 'published',
    },
  })

  const resumePage = await payload.db.upsert({
    collection: CollectionSlug.Pages,
    where: {
      slug: {
        equals: 'resume',
      },
    },
    data: {
      title: 'Resume',
      slug: 'resume',
      protected: true,
      layout: 'resume',
      _status: 'published',
    },
  })

  const legalNoticePage = await payload.db.upsert({
    collection: CollectionSlug.Pages,
    where: {
      slug: {
        equals: 'legal-notice',
      },
    },
    data: {
      title: 'Legal Notice',
      slug: 'legal-notice',
      protected: true,
      layout: 'legal',
      _status: 'published',
    },
  })

  const privacyPolicyPage = await payload.db.upsert({
    collection: CollectionSlug.Pages,
    where: {
      slug: {
        equals: 'privacy-policy',
      },
    },
    data: {
      title: 'Privacy Policy',
      slug: 'privacy-policy',
      protected: true,
      layout: 'resume',
      _status: 'published',
    },
  })

  await payload.db.updateGlobal({
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
              text: resumePage.title,
              doc: {
                relationTo: CollectionSlug.Pages,
                value: resumePage.id,
              },
            },
            {
              linkType: 'internal',
              text: aboutMePage.title,
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
              text: homePage.title,
              doc: {
                relationTo: CollectionSlug.Pages,
                value: homePage.id,
              },
            },
            {
              linkType: 'internal',
              text: aboutMePage.title,
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
              text: 'All Posts',
              url: '/blog',
            },
            {
              linkType: 'custom',
              text: 'All Topics',
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
              text: 'Resume Page',
              doc: {
                relationTo: CollectionSlug.Pages,
                value: resumePage.id,
              },
            },
            {
              linkType: 'custom',
              text: 'Download PDF',
              url: '/resume/latest',
            },
          ],
        },
        legalPages: {
          entries: [
            {
              linkType: 'internal',
              text: legalNoticePage.title,
              doc: {
                relationTo: CollectionSlug.Pages,
                value: legalNoticePage.id,
              },
            },
            {
              linkType: 'internal',
              text: privacyPolicyPage.title,
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

export async function down({
  payload: _payload,
  req: _req,
  session: _session,
}: MigrateDownArgs): Promise<void> {
  // Migration code
}
