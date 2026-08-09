import type { CollectionConfig } from 'payload'

import { forbidden } from '@/access/forbidden'
import { CollectionSlug } from '@/types/collections'

/**
 * Bookkeeping table mapping media assets to the documents that use them.
 *
 * One row per (asset, source document, path). Rows are written by the
 * `references` plugin on every save and removed when the source document
 * is deleted, so "is this asset still in use?" is a single indexed query
 * instead of a per-collection scan whose field paths differ everywhere.
 *
 * Fully machine-managed: all access is denied so nothing can edit it by hand,
 * and it is hidden from the admin navigation. The plugin writes with
 * `overrideAccess` (the Local API default).
 */
export const References: CollectionConfig = {
  slug: CollectionSlug.DocumentReferences,
  access: {
    create: forbidden,
    delete: forbidden,
    read: forbidden,
    update: forbidden,
  },
  admin: {
    hidden: true,
    useAsTitle: 'assetId',
  },
  disableDuplicate: true,
  fields: [
    {
      name: 'assetCollection',
      type: 'text',
      required: true,
      index: true,
      admin: {
        description: 'Slug of the referenced media collection.',
      },
    },
    {
      name: 'assetId',
      type: 'text',
      required: true,
      index: true,
      admin: {
        description: 'ID of the referenced media document.',
      },
    },
    {
      name: 'sourceCollection',
      type: 'text',
      required: true,
      index: true,
      admin: {
        description: 'Slug of the collection or global holding the reference.',
      },
    },
    {
      name: 'sourceId',
      type: 'text',
      required: true,
      index: true,
      admin: {
        description: 'ID of the referencing document (the global slug for globals).',
      },
    },
    {
      name: 'sourceType',
      type: 'select',
      required: true,
      defaultValue: 'collection',
      options: [
        {
          label: 'Collection',
          value: 'collection',
        },
        {
          label: 'Global',
          value: 'global',
        },
      ],
    },
    {
      name: 'path',
      type: 'text',
      admin: {
        description: 'Dotted path to the reference within the source document.',
      },
    },
  ],
  timestamps: true,
}
