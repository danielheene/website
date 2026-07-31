import { TextField } from 'payload'

import { processIncomingFlags } from './hooks/processIncomingFlags'

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
          '+auto-generated',
          '-auto-generated',
          '+resume-asset',
          '-resume-asset',
          '+thumbnail',
          '-thumbnail',
          '+document',
          '-document',
          '+audio-thumbnail',
          '-audio-thumbnail',
          '+video-thumbnail',
          '-video-thumbnail',
          '+document-thumbnail',
          '-document-thumbnail',
        ],
      },
      additionalItems: false,
      required: false,
      default: [],
    }),
  ],
  hooks: {
    beforeChange: [
      processIncomingFlags,
    ],
  },
})
