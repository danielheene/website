import { TextField } from 'payload'

import { normalizeIncomingFlags } from './hooks/normalizeIncomingFlags'

/**
 * Markers describing how an asset came to exist — set by the jobs queue when it
 * generates thumbnails and resume documents, and used to filter those out of
 * the admin list views (see `scripts/seed-query-presets.ts`).
 *
 * `seeded-dummy` is set by seed scripts (see `scripts/seed-pages.ts` and its
 * siblings) on fixture documents, so they can be found and removed without
 * touching real content.
 *
 * `unsplash-import` marks a `MediaImages` document created via the in-admin
 * Unsplash search, so imported stock photos can be filtered or audited later.
 *
 * A non-empty list *is* the "this was generated" marker — hand-uploaded assets
 * carry none — so the flags describe only what kind of artefact it is.
 *
 * Flags are stored as plain names. An earlier version accepted `+flag`/`-flag`
 * operators so a caller could add or remove one without reading the document
 * first, but every writer only ever creates documents with a fixed set, and the
 * prefixes made the field's type dishonest: Payload generates one type per
 * field for both reads and writes, so a field written as `+thumbnail` but read
 * back as `thumbnail` cannot be described accurately. Callers that genuinely
 * need to merge can spread the existing array.
 */
export const GENERATOR_FLAGS = [
  'resume-asset',
  'thumbnail',
  'document',
  'audio-thumbnail',
  'video-thumbnail',
  'document-thumbnail',
  'unsplash-import',
  'seeded-dummy',
] as const

export type GeneratorFlag = (typeof GENERATOR_FLAGS)[number]

export const GeneratorFlagsField = (): TextField => ({
  name: 'generatorFlags',
  type: 'text',
  hasMany: true,
  admin: {
    hidden: true,
  },

  typescriptSchema: [
    () => ({
      type: 'array',
      items: {
        type: 'string',
        enum: [
          ...GENERATOR_FLAGS,
        ],
      },
      additionalItems: false,
      required: false,
      default: [],
    }),
  ],
  hooks: {
    beforeChange: [
      normalizeIncomingFlags,
    ],
  },
})
