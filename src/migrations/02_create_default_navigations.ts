import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-mongodb'

import { CollectionSlug } from '@/types/collections'
import { GlobalSlug } from '@/types/globals'

export async function up({
  payload,
  req,
  session,
}: MigrateUpArgs): Promise<void> {
  const pages = {
    home: await payload
      .find({
        collection: CollectionSlug.Pages,
        where: {
          slug: {
            equals: 'home',
          },
        },
      })
      .then(({ docs }) => docs[0]),
    aboutMe: await payload
      .find({
        collection: CollectionSlug.Pages,
        where: {
          slug: {
            equals: 'about-me',
          },
        },
      })
      .then(({ docs }) => docs[0]),
    resume: await payload
      .find({
        collection: CollectionSlug.Pages,
        where: {
          slug: {
            equals: 'resume',
          },
        },
      })
      .then(({ docs }) => docs[0]),
    legalNotice: await payload
      .find({
        collection: CollectionSlug.Pages,
        where: {
          slug: {
            equals: 'legal-notice',
          },
        },
      })
      .then(({ docs }) => docs[0]),
    privacyPolicy: await payload
      .find({
        collection: CollectionSlug.Pages,
        where: {
          slug: {
            equals: 'privacy-policy',
          },
        },
      })
      .then(({ docs }) => docs[0]),
  }

  payload.logger.info('Creating main navigation links for header...')
  await payload.updateGlobal({
    slug: GlobalSlug.SettingsPageHeader,
    context: {
      skipRevalidate: true,
    },
    draft: false,
    data: {
      mainNavigation: [
        {
          link: {
            label: 'Resume',
            type: 'reference',
            reference: {
              relationTo: CollectionSlug.Pages,
              value: pages.resume?.id,
            },
          },
        },
      ],
    },
    req,
  })
  payload.logger.info('Main navigation links for header created successfully!')

  payload.logger.info('Creating default navigation links for footer...')
  await payload.updateGlobal({
    slug: GlobalSlug.SettingsPageFooter,
    context: {
      skipRevalidate: true,
    },
    draft: false,
    data: {
      navGroups: [
        {
          title: 'General',
          entries: [
            {
              link: {
                label: pages.home.title,
                type: 'reference',
                reference: {
                  relationTo: CollectionSlug.Pages,
                  value: pages.home.id,
                },
              },
            },
            {
              link: {
                label: pages.resume.title,
                type: 'reference',
                reference: {
                  relationTo: CollectionSlug.Pages,
                  value: pages.resume.id,
                },
              },
            },
            {
              link: {
                label: pages.aboutMe.title,
                type: 'reference',
                reference: {
                  relationTo: CollectionSlug.Pages,
                  value: pages.aboutMe.id,
                },
              },
            },
          ],
        },
        {
          title: 'Blog',
          entries: [
            {
              link: {
                label: 'Posts',
                type: 'custom',
                url: '/posts',
              },
            },
            {
              link: {
                label: 'Categories',
                type: 'custom',
                url: '/categories',
              },
            },
            {
              link: {
                label: 'Tags',
                type: 'custom',
                url: '/tags',
              },
            },
          ],
        },
      ],
    },
    req,
  })
  payload.logger.info('Default navigation for footer created successfully!')

  payload.logger.info('Creating legal navigation links for footer...')
  await payload.updateGlobal({
    slug: GlobalSlug.SettingsPageFooter,
    context: {
      skipRevalidate: true,
    },
    draft: false,
    data: {
      legalLinks: {
        title: 'Legal Pages',
        entries: [
          {
            link: {
              label: pages.legalNotice.title,
              type: 'reference',
              reference: {
                relationTo: CollectionSlug.Pages,
                value: pages.legalNotice.id,
              },
            },
          },
          {
            link: {
              label: pages.privacyPolicy.title,
              type: 'reference',
              reference: {
                relationTo: CollectionSlug.Pages,
                value: pages.privacyPolicy.id,
              },
            },
          },
        ],
      },
    },
    req,
  })
  payload.logger.info('Legal navigation links for footer created successfully!')
}

export async function down({ req, session }: MigrateDownArgs): Promise<void> {
  // Migration code
}
