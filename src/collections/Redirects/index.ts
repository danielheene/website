import type { CollectionConfig } from 'payload'

import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import { AdminGroup } from '@/types/admin-panel'
import { CollectionSlug } from '@/types/collections'

import { normalizeFromPath } from './hooks/normalizeFromPath'
import { preventRedirectLoops } from './hooks/preventRedirectLoops'

/** HTTP status codes offered for redirects. */
export const REDIRECT_STATUS_CODES = [
  {
    label: '301 — Moved Permanently',
    value: '301',
  },
  {
    label: '302 — Found (temporary)',
    value: '302',
  },
  {
    label: '307 — Temporary Redirect (preserves method)',
    value: '307',
  },
  {
    label: '308 — Permanent Redirect (preserves method)',
    value: '308',
  },
] as const

/**
 * Source-path to destination mappings applied by `proxy.ts` before rendering.
 *
 * A destination is either a literal path/URL or a reference to a document, in
 * which case the current path is resolved at request time — so a later slug
 * change cannot turn the redirect into a dead link.
 *
 * Rows are created manually by editors, and automatically by
 * `createSlugChangeRedirect` when a document's slug changes.
 */
export const Redirects: CollectionConfig = {
  slug: CollectionSlug.Redirects,
  labels: {
    singular: 'Redirect',
    plural: 'Redirects',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    // the proxy reads redirects for anonymous visitors
    read: anyone,
    update: authenticated,
  },
  admin: {
    group: AdminGroup.Settings,
    useAsTitle: 'from',
    defaultColumns: [
      'from',
      'type',
      'statusCode',
      'enabled',
      'updatedAt',
    ],
    listSearchableFields: [
      'from',
      'toPath',
    ],
    disableCopyToLocale: true,
  },
  hooks: {
    beforeValidate: [
      normalizeFromPath,
    ],
    beforeChange: [
      preventRedirectLoops,
    ],
  },
  fields: [
    {
      name: 'from',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      label: 'From path',
      admin: {
        description:
          'Path to redirect away from, e.g. /old-article. Leading slash is added automatically; query strings are ignored.',
      },
    },
    {
      name: 'type',
      type: 'radio',
      required: true,
      defaultValue: 'reference',
      options: [
        {
          label: 'Document',
          value: 'reference',
        },
        {
          label: 'Custom path or URL',
          value: 'custom',
        },
      ],
      admin: {
        layout: 'horizontal',
        description: 'Referencing a document keeps the target correct if its slug changes later.',
      },
    },
    {
      name: 'toDocument',
      type: 'relationship',
      label: 'Target document',
      maxDepth: 1,
      relationTo: [
        CollectionSlug.Pages,
        CollectionSlug.BlogPosts,
        CollectionSlug.BlogTopics,
        CollectionSlug.ResumeDocuments,
      ],
      admin: {
        condition: (_, siblingData) => siblingData?.type === 'reference',
      },
    },
    {
      name: 'toPath',
      type: 'text',
      label: 'Target path or URL',
      admin: {
        condition: (_, siblingData) => siblingData?.type === 'custom',
        description: 'An internal path such as /blog, or an absolute URL.',
      },
    },
    {
      name: 'statusCode',
      type: 'select',
      required: true,
      defaultValue: '301',
      options: [
        ...REDIRECT_STATUS_CODES,
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'enabled',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description: 'Disable to keep the row without applying it.',
      },
    },
    {
      name: 'origin',
      type: 'select',
      defaultValue: 'manual',
      options: [
        {
          label: 'Manual',
          value: 'manual',
        },
        {
          label: 'Automatic (slug change)',
          value: 'slug-change',
        },
      ],
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'How this redirect was created.',
      },
    },
  ],
  timestamps: true,
}
