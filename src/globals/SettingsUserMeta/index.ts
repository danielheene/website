import { authenticated } from '@/access/authenticated'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { AdminGroup, CollectionSlug, GlobalSlug } from '@custom-types'
import { revalidateTag } from 'next/cache'
import { GlobalConfig } from 'payload'

export const SettingsUserMeta: GlobalConfig = {
  slug: GlobalSlug.SettingsUserMeta,
  label: 'User Meta',
  access: {
    read: authenticatedOrPublished,
    update: authenticated,
  },
  hooks: {
    afterChange: [
      async ({ doc, context }) => {
        if (context.skipRevalidate) return doc
        revalidateTag(GlobalSlug.SettingsUserMeta)
      },
    ],
  },
  admin: {
    group: AdminGroup.Settings,
  },
  typescript: { interface: 'UserMetaData' },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'jobTitle',
      type: 'text',
    },
    {
      name: 'url',
      type: 'text',
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: CollectionSlug.MediaImages,
    },
    {
      name: 'email',
      type: 'email',
    },
    {
      name: 'telephone',
      type: 'text',
    },
    {
      name: 'description',
      type: 'text',
    },
    {
      name: 'sameAs',
      type: 'array',
      fields: [
        {
          name: 'url',
          type: 'text',
        },
      ],
    },
    {
      name: 'duns',
      type: 'text',
    },
    {
      name: 'birthDate',
      type: 'date',
    },
    {
      name: 'birthPlace',
      type: 'text',
    },
    {
      name: 'gender',
      type: 'text',
    },
    {
      name: 'homeLocation',
      type: 'text',
    },
    {
      name: 'knowsLanguage',
      type: 'array',
      fields: [
        {
          name: 'language',
          type: 'text',
        },
      ],
    },
    {
      name: 'vatID',
      type: 'text',
    },
    {
      name: 'workLocation',
      type: 'text',
    },
    {
      name: 'worksFor',
      type: 'group',
      fields: [
        {
          name: 'name',
          type: 'text',
        },
        {
          name: 'url',
          type: 'text',
        },
      ],
    },
    {
      name: 'address',
      type: 'group',
      fields: [
        {
          name: 'streetAddress',
          type: 'text',
        },
        {
          name: 'addressLocality',
          type: 'text',
        },
        {
          name: 'addressRegion',
          type: 'text',
        },
        {
          name: 'postalCode',
          type: 'text',
        },
        {
          name: 'addressCountry',
          type: 'text',
        },
      ],
    },
  ],
  versions: false,
}
