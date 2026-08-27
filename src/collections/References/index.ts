import type { CollectionConfig } from 'payload'

import { authenticated } from '@/access/authenticated'
import { forbidden } from '@/access/forbidden'
import { CollectionSlug } from '@/types/collections'

/**
 * Bookkeeping table mapping referenced documents to the documents that use
 * them — every collection, via both `relationship` and `upload` fields, not
 * only media.
 *
 * One row per (target, source document, path). Rows are written by the
 * `references` plugin on every save and removed when the source document
 * is deleted, so "is this document still in use?" is a single indexed query
 * instead of a per-collection scan whose field paths differ everywhere.
 *
 * Machine-managed: every write is denied so nothing can edit it by hand, and it
 * is hidden from the admin navigation. The plugin writes with `overrideAccess`
 * (the Local API default), which bypasses those rules.
 *
 * Reads are allowed for authenticated users. Denying them too made the table
 * impossible to inspect — a row that is missing and a row that is merely
 * unreadable look identical from the admin panel.
 *
 * Being `hidden` it has no nav entry; reach it directly at
 * `/admin/collections/document-references`.
 */
export const References: CollectionConfig = {
  slug: CollectionSlug.DocumentReferences,
  access: {
    create: forbidden,
    delete: forbidden,
    // readable so the table can be inspected when a reference looks wrong;
    // writes stay denied, and the plugin bypasses access via `overrideAccess`
    read: authenticated,
    update: forbidden,
  },
  admin: {
    hidden: false,
    useAsTitle: 'targetId',
    defaultColumns: [
      'targetCollection',
      'targetId',
      'sourceCollection',
      'sourceId',
      'path',
    ],
  },
  disableDuplicate: true,
  fields: [
    {
      name: 'targetCollection',
      type: 'text',
      required: true,
      index: true,
      admin: {
        description: 'Slug of the referenced collection.',
      },
    },
    {
      name: 'targetId',
      type: 'text',
      required: true,
      index: true,
      admin: {
        description: 'ID of the referenced document.',
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
