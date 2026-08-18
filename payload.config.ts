import path from 'node:path'
import * as process from 'node:process'
import { fileURLToPath } from 'node:url'

import { buildConfig } from 'payload'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { redisKVAdapter } from '@payloadcms/kv-redis'
import { importExportPlugin } from '@payloadcms/plugin-import-export'
import { sentryPlugin } from '@payloadcms/plugin-sentry'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'

import * as Sentry from '@sentry/nextjs'
import sharp from 'sharp'

import { BLOCKS } from '@/blocks'
import { COLLECTIONS } from '@/collections'
import { GLOBALS } from '@/globals'
import { TASKS } from '@/jobs-queue/tasks'
import { WORKFLOWS } from '@/jobs-queue/workflows'
import { SENTRY_ENABLED } from '@/lib/sentry/options'
import { useSendAdapter } from '@/lib/useSendAdapter'
import { redirectsPlugin } from '@/plugins/redirects'
import { referencesPlugin } from '@/plugins/references'
import { CollectionSlug } from '@/types/collections'
import { QueueSlug } from '@/types/jobs-queue'
import { SKILL_TYPE } from '@/types/select-options'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const config = buildConfig({
  admin: {
    autoRefresh: true,
    components: {
      graphics: {
        Icon: '@/components/AdminPanel#Icon',
        Logo: '@/components/AdminPanel#Logo',
      },
      Nav: '@/components/AdminPanel#Nav',
    },
    dashboard: {
      defaultLayout: [
        {
          widgetSlug: 'umami-widget',
          width: 'full',
        },
      ],
      widgets: [
        {
          slug: 'scheduled-resume-generation-widget',
          label: 'Scheduled Resume Generation',
          Component: '@/widgets/ScheduledResumeGenerationWidget#ScheduledResumeGenerationWidget',
          minWidth: 'full',
          maxWidth: 'full',
        },
        {
          slug: 'umami-widget',
          label: 'Umami',
          Component: '@/widgets/UmamiWidget#UmamiWidget',
          minWidth: 'full',
          maxWidth: 'full',
        },
      ],
    },
    dateFormat: 'yyyy-MM-dd HH:mm',
    importMap: {
      baseDir: path.resolve(dirname),
    },

    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },

    meta: {
      icons: [
        {
          rel: 'icon',
          url: '/favicon.ico',
          sizes: '16x16 32x32 48x48',
          type: 'image/x-icon',
        },
        {
          rel: 'icon',
          url: '/favicon.svg',
          type: 'image/svg+xml',
        },
      ],
    },
    suppressHydrationWarning: true,
    timezones: {
      supportedTimezones: [
        {
          label: 'Europe/Berlin',
          value: 'Europe/Berlin',
        },
      ],
      defaultTimezone: 'Europe/Berlin',
    },
    user: CollectionSlug.Users,
  },
  bin: [],
  blocks: BLOCKS,
  csrf: [
    process.env.SERVER_URL,
  ],
  cors: {
    origins: [
      process.env.SERVER_URL,
    ],
    headers: [],
  },
  defaultDepth: 10,
  editor: lexicalEditor(),
  db: mongooseAdapter({
    url: process.env.DATABASE_URL,
  }),
  collections: COLLECTIONS,
  debug: process.env.NODE_ENV !== 'production',
  // biome-ignore lint/correctness/useHookAtTopLevel: <useSend is a mailing service, not a React hook>
  email: useSendAdapter({
    apiKey: process.env.USESEND_API_KEY,
    useSendUrl: process.env.USESEND_URL,
    defaultFromAddress: process.env.USESEND_DEFAULT_FROM_ADDRESS,
    defaultFromName: process.env.USESEND_DEFAULT_FROM_NAME,
  }),
  endpoints: [],
  folders: {
    browseByFolder: false,
  },
  globals: GLOBALS,
  graphQL: {
    disable: true,
    disablePlaygroundInProduction: true,
  },
  jobs: {
    enableConcurrencyControl: true,
    tasks: TASKS,
    workflows: WORKFLOWS,
    shouldAutoRun: async () => {
      return process.env.PAYLOAD_JOBS_ENABLE_APP_WORKERS === 'true'
    },
    deleteJobOnComplete: false,
    autoRun: [
      {
        cron: '* * * * *',
        queue: QueueSlug.Default,
        limit: 10,
      },
      {
        cron: '* * * * *',
        queue: QueueSlug.ResumeGeneration,
        limit: 10,
      },
    ],
    jobsCollectionOverrides: ({ defaultJobsCollection }) => ({
      ...defaultJobsCollection,
      admin: {
        ...defaultJobsCollection.admin,
        hidden: false,
      },
    }),
  },
  kv: redisKVAdapter({
    redisURL: process.env.REDIS_URL,
  }),

  localization: false,
  plugins: [
    referencesPlugin(),
    redirectsPlugin(),
    importExportPlugin({
      collections: undefined,
      defaultVersionStatus: 'published',
      overrideImportCollection: ({ collection }) => ({
        ...collection,
        slug: CollectionSlug.PayloadImports,
        admin: {
          ...collection.admin,
          hidden: false,
        },
      }),
      overrideExportCollection: ({ collection }) => ({
        ...collection,
        slug: CollectionSlug.PayloadExports,
        admin: {
          ...collection.admin,
          hidden: false,
        },
      }),
    }),
    // nestedDocsPlugin({
    //   collections: [CollectionSlug['ResumeSkills']],
    //
    // }),
    /**
     * Reports errors raised inside Payload — collection hooks, access control,
     * the jobs queue and admin requests — which sit outside the Next.js request
     * lifecycle that `onRequestError` covers.
     *
     * Gated on the same DSN check as the rest of the SDK, so it is inert
     * without credentials.
     */
    sentryPlugin({
      enabled: SENTRY_ENABLED,
      Sentry,
      options: {
        // 500s are captured by default; 401/403/404 are normal traffic and
        // would drown the real failures
        captureErrors: [
          400,
          409,
          500,
        ],
        context: ({ defaultContext, req }) => ({
          ...defaultContext,
          tags: {
            ...defaultContext.tags,
            source: 'payload',
          },
          user: req?.user
            ? {
                id: String(req.user.id),
                email: req.user.email,
              }
            : defaultContext.user,
        }),
      },
    }),
    s3Storage({
      enabled: true,
      collections: {
        [CollectionSlug.MediaImages]: {
          prefix: CollectionSlug.MediaImages,
        },
        [CollectionSlug.MediaVideos]: {
          prefix: CollectionSlug.MediaVideos,
        },
        [CollectionSlug.MediaDocuments]: {
          prefix: CollectionSlug.MediaDocuments,
        },
        [CollectionSlug.MediaAudios]: {
          prefix: CollectionSlug.MediaAudios,
        },
      },
      useCompositePrefixes: true,
      clientUploads: true,
      disableLocalStorage: true,
      bucket: process.env.S3_BUCKET,
      config: {
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY,
          secretAccessKey: process.env.S3_SECRET_KEY,
        },
        forcePathStyle: true,
        endpoint: process.env.S3_ENDPOINT,
        region: process.env.S3_REGION,
      },
    }),
  ],
  serverURL: process.env.SERVER_URL,
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  telemetry: false,
  typescript: {
    outputFile: path.resolve(dirname, 'src/types/payload.ts'),
    schema: [
      ({ jsonSchema }) => ({
        ...jsonSchema,
        definitions: {
          ...jsonSchema.definitions,
          SkillType: {
            title: 'SkillType',
            type: 'string',
            enum: Object.values(SKILL_TYPE),
          },
          SkillTypeSortable: {
            title: 'SkillTypeSortable',
            type: 'object',
            properties: {
              id: {
                $ref: '#/definitions/SkillType',
              },
              label: {
                type: 'string',
              },
            },
            additionalProperties: false,
            required: [
              'id',
              'label',
            ],
          },
          SkillEntrySortable: {
            title: 'SkillEntrySortable',
            type: 'object',
            properties: {
              id: {
                type: 'string',
              },
              label: {
                type: 'string',
              },
              caption: {
                type: 'string',
              },
            },
            additionalProperties: false,
            required: [
              'id',
              'label',
            ],
          },
        },
      }),
    ],
  },
})

export default config
