import { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-mongodb'

import { SiteSettingsDefaults } from '@/globals/SiteSettings'
import { CollectionSlug } from '@/types/collections'
import { GlobalSlug } from '@/types/globals'
import { Page } from '@/types/payload'

export async function up({ payload, req, session: _session }: MigrateUpArgs): Promise<void> {
  const migration = {
    payload,
    req,
  }

  const homePage = await createOrUpdatePage(migration, {
    slug: 'home',
    title: 'Home',
    layout: 'home',
  })

  const aboutMePage = await createOrUpdatePage(migration, {
    slug: 'about-me',
    title: 'About Me',
    layout: 'default',
  })

  const resumePage = await createOrUpdatePage(migration, {
    slug: 'resume',
    title: 'Resume',
    layout: 'resume',
  })

  const legalNoticePage = await createOrUpdatePage(migration, {
    slug: 'legal-notice',
    title: 'Legal Notice',
    layout: 'legal',
  })

  const privacyPolicyPage = await createOrUpdatePage(migration, {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    layout: 'resume',
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

async function createOrUpdatePage(
  { payload, req }: Pick<MigrateUpArgs, 'payload' | 'req'>,
  page: Pick<Page, 'slug' | 'title' | 'layout'>,
): Promise<Page> {
  const where = {
    slug: {
      equals: page.slug,
    },
  }

  const data = {
    ...page,
    protected: true,
    _status: 'published' as const,
  }

  // No Next context in the migrate CLI to revalidate from.
  const context = {
    skipRevalidate: true,
  }

  const { totalDocs } = await payload.count({
    collection: CollectionSlug.Pages,
    req,
    where,
  })

  if (!totalDocs) {
    return payload.create({
      collection: CollectionSlug.Pages,
      context,
      data,
      draft: false,
      req,
    })
  }

  const {
    docs: [updated],
  } = await payload.update({
    collection: CollectionSlug.Pages,
    context,
    data,
    draft: false,
    req,
    where,
  })

  return updated
}
