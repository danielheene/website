import { postgresAdapter } from '@payloadcms/db-postgres'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import {
  BlockquoteFeature,
  BoldFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  IndentFeature,
  InlineCodeFeature,
  ItalicFeature,
  lexicalEditor,
  LinkFeature,
  OrderedListFeature,
  ParagraphFeature,
  UnderlineFeature,
  UnorderedListFeature,
} from '@payloadcms/richtext-lexical'
import sharp from 'sharp'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import nodemailerSendgrid from 'nodemailer-sendgrid'
import nodemailer from 'nodemailer'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { resolveCollections, resolveGlobals } from '@/payload/utilities/schemaHelpers'
import { seedHandler } from '@/payload/endpoints/seed'
import * as process from 'node:process'
import { createBlurHashTask } from '@/payload/tasks/createBlurHashTask'
import { generateImageMetaWorkflow } from '@/payload/workflows/generateImageMetaWorkflow'
import { createBrightnessTask } from '@/payload/tasks/createBrightnessTask'
import { createPaletteTask } from '@/payload/tasks/createPaletteTask'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  jobs: {
    tasks: [createBlurHashTask, createBrightnessTask, createPaletteTask],
    workflows: [generateImageMetaWorkflow],
  },
  admin: {
    components: {
      graphics: {
        Icon: '/payload/components/Icon',
        Logo: '/payload/components/Logo',
      },
    },
    dateFormat: 'yyyy-MM-dd',
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      icons: [
        {
          rel: 'icon',
          type: 'image/x-icon',
          url: '/favicon.ico',
          sizes: '32x32',
        },
        {
          rel: 'icon',
          type: 'image/svg+xml',
          url: '/favicon.svg',
        },
      ],
    },
    user: 'users',
  },
  editor: lexicalEditor({
    features: [
      HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
      ItalicFeature(),
      BoldFeature(),
      UnderlineFeature(),
      OrderedListFeature(),
      UnorderedListFeature(),
      ParagraphFeature(),
      BlockquoteFeature(),
      LinkFeature(),
      HorizontalRuleFeature(),
      IndentFeature(),
      InlineCodeFeature(),
      FixedToolbarFeature(),
    ],
  }),
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  collections: await resolveCollections(['resume', 'blog', 'general', 'settings']),
  debug: process.env.NODE_ENV === 'development',
  email: process.env.SENDGRID_API_KEY
    ? nodemailerAdapter({
        defaultFromAddress: 'no-reply@heene.io',
        defaultFromName: 'Notifications from Daniel Heene',

        transport: nodemailer.createTransport(
          nodemailerSendgrid({
            apiKey: process.env.SENDGRID_API_KEY,
          }),
        ),
      })
    : undefined,
  endpoints: [
    // The seed endpoint is used to populate the database with some example data
    // You should delete this endpoint before deploying your site to production
    {
      handler: seedHandler,
      method: 'get',
      path: '/seed',
    },
  ],
  globals: await resolveGlobals(['resume', 'blog', 'general', 'settings']),
  localization: {
    locales: [
      {
        label: 'English',
        code: 'en',
      },
    ],
    defaultLocale: 'en',
    fallback: true,
  },
  plugins: [
    vercelBlobStorage({
      enabled: true,
      // clientUploads: true,
      // addRandomSuffix: true,
      collections: {
        media: {
          prefix: process.env.VERCEL_ENV || 'development',
        },
      },
      token: process.env.BLOB_READ_WRITE_TOKEN || '',
    }),
  ],
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  telemetry: false,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
