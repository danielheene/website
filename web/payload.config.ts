import path from 'node:path'
import * as process from 'node:process'
import { fileURLToPath } from 'node:url'

import { buildConfig } from 'payload'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { redisKVAdapter } from '@payloadcms/kv-redis'
import { importExportPlugin } from '@payloadcms/plugin-import-export'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'

import sharp from 'sharp'

import { BLOCKS } from '@/blocks'
import { COLLECTIONS } from '@/collections'
import { GLOBALS } from '@/globals'
import { TASKS } from '@/jobs-queue/tasks'
import { useSendAdapter } from '@/lib/useSendAdapter'
import { CollectionSlug } from '@/types/collections'
import { QueueSlug } from '@/types/jobs-queue'
import { SKILL_TYPE } from '@/types/select-options'

import { loadEnv } from './env'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

await loadEnv(dirname)

export const config = buildConfig({
  admin: {
    autoRefresh: true,
    components: {
      graphics: {
        Icon: '@/components/AdminPanel#Icon',
        Logo: '@/components/AdminPanel#Logo',
      },
      Nav: '@/components/AdminPanel#Nav',
      providers: [
        '@/contexts/UmamiCharts#UmamiChartsContainer',
      ],
    },
    dashboard: {
      defaultLayout: [
        {
          widgetSlug: 'umami-control-bar',
          width: 'full',
        },
        {
          widgetSlug: 'umami-stats-widget',
          width: 'full',
        },
        {
          widgetSlug: 'umami-pageviews-widget',
          width: 'medium',
        },
        {
          widgetSlug: 'umami-paths-widget',
          width: 'x-small',
        },
        {
          widgetSlug: 'umami-events-widget',
          width: 'x-small',
        },
      ],
      widgets: [
        {
          slug: 'umami-control-bar',
          label: 'Umami: Control Bar',
          Component: '@/components/AdminPanel#UmamiControlBar',
          minWidth: 'full',
          maxWidth: 'full',
        },
        {
          slug: 'umami-stats-widget',
          label: 'Umami: Stats',
          Component: '@/components/AdminPanel#UmamiStatsWidget',
          minWidth: 'full',
          maxWidth: 'full',
        },
        {
          slug: 'umami-pageviews-widget',
          label: 'Umami: PageViews',
          Component: '@/components/AdminPanel#UmamiPageViewsWidget',
          minWidth: 'medium',
          maxWidth: 'full',
        },
        {
          slug: 'umami-paths-widget',
          label: 'Umami: Paths',
          Component: '@/components/AdminPanel#UmamiPathsWidget',
          minWidth: 'x-small',
          maxWidth: 'medium',
        },
        {
          slug: 'umami-events-widget',
          label: 'Umami: Events',
          Component: '@/components/AdminPanel#UmamiEventsWidget',
          minWidth: 'x-small',
          maxWidth: 'medium',
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
    user: CollectionSlug['Users'],
  },
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
    shouldAutoRun: async () => {
      return process.env.ENABLE_JOB_WORKERS === 'true'
    },
    autoRun: [
      {
        cron: '* * * * *',
        queue: QueueSlug.Default,
        limit: 1,
      },
      {
        cron: '* * * * *',
        queue: QueueSlug.ResumeGenerator,
        limit: 1,
      },
    ],
    jobsCollectionOverrides: ({ defaultJobsCollection }) => {
      if (!defaultJobsCollection.admin) {
        defaultJobsCollection.admin = {}
      }

      defaultJobsCollection.admin.hidden = false
      return defaultJobsCollection
    },
  },
  kv: redisKVAdapter({
    redisURL: process.env.REDIS_URL,
  }),

  localization: false,
  plugins: [
    importExportPlugin({
      collections: undefined,
      defaultVersionStatus: 'published',
      overrideImportCollection: ({ collection }) => ({
        ...collection,
        slug: CollectionSlug['PayloadImports'],
      }),
      overrideExportCollection: ({ collection }) => ({
        ...collection,
        slug: CollectionSlug['PayloadExports'],
      }),
    }),
    // nestedDocsPlugin({
    //   collections: [CollectionSlug['ResumeSkills']],
    //
    // }),
    // sentryPlugin({
    //   enabled: process.env.SENTRY_ENABLED === 'true',
    //   options: {
    //   },
    //   Sentry: SentryInstance,
    // }),
    s3Storage({
      enabled: true,
      collections: {
        [CollectionSlug['MediaImages']]: {
          prefix: 'images',
        },
        [CollectionSlug['MediaVideos']]: {
          prefix: 'videos',
        },
        [CollectionSlug['MediaDocuments']]: {
          prefix: 'documents',
        },
        [CollectionSlug['MediaAudios']]: {
          prefix: 'audios',
        },
        [CollectionSlug['ResumeFiles']]: true,
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
