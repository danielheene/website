import { BLOCKS } from '@/blocks'
import { COLLECTIONS } from '@/collections'
import { LinkField } from '@/fields/Link'
import { GLOBALS } from '@/globals'
import { generateContentURL } from '@/utilities/generateContentURL'
import { useSendAdapter } from '@/utilities/useSendAdapter'
import { CollectionSlug } from '@custom-types'
import { BlogCategory } from '@payload-types'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { redisKVAdapter } from '@payloadcms/kv-redis'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import {
  AlignFeature,
  BlockquoteFeature,
  BoldFeature,
  ChecklistFeature,
  EXPERIMENTAL_TableFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  IndentFeature,
  InlineCodeFeature,
  InlineToolbarFeature,
  ItalicFeature,
  lexicalEditor,
  LinkFeature,
  OrderedListFeature,
  ParagraphFeature,
  RelationshipFeature,
  StrikethroughFeature,
  UnderlineFeature,
  UnorderedListFeature,
  UploadFeature,
} from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import * as process from 'node:process'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const config = buildConfig({
  experimental: {
    localizeStatus: true,
  },

  admin: {
    autoRefresh: true,
    components: {
      graphics: {
        Icon: '@/components/AdminPanel#Icon',
        Logo: '@/components/AdminPanel#Logo',
      },
      Nav: '@/components/AdminPanel#Nav',
      // providers: ['@/contexts/UmamiCharts#UmamiChartsProvider'],
      // views: {
      //   dashboard: {
      //     Component: '/payload/components/Dashboard',
      //   },
      // },
    },
    dashboard: {
      widgets: [
        {
          slug: 'dummy-widget',
          ComponentPath: '@/components/AdminPanel#DummyWidget',
          minWidth: 'x-small',
          maxWidth: 'full',
        },
      ],
    },
    dateFormat: 'yyyy-MM-dd',
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
  blocks: BLOCKS,
  csrf: [process.env.NEXT_PUBLIC_SERVER_URL],
  cors: {
    origins: [process.env.NEXT_PUBLIC_SERVER_URL],
    headers: [],
  },
  editor: lexicalEditor({
    admin: {
      hideGutter: true,
    },
    features: [
      /* format feature */
      ParagraphFeature(),
      HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4' /* 'h5', */ /* 'h6' */] }),
      OrderedListFeature(),
      UnorderedListFeature(),
      ChecklistFeature(),
      BlockquoteFeature(),
      /* text feature */
      BoldFeature(),
      ItalicFeature(),
      UnderlineFeature(),
      StrikethroughFeature(),
      // SubscriptFeature(),
      // SuperscriptFeature(),
      InlineCodeFeature(),

      /* align feature */
      AlignFeature(),

      /* indent feature */
      IndentFeature(),

      LinkFeature({
        fields: LinkField()['fields'],
      }),
      RelationshipFeature(),
      UploadFeature(),
      HorizontalRuleFeature(),
      FixedToolbarFeature({
        applyToFocusedEditor: true,
        customGroups: {
          /**
           * text:
           * paragraph, headings, ordered list, unordered list, check list, blockquote
           */
          text: {
            type: 'dropdown',
            order: 10,
          },

          /**
           * format:
           * bold, italic, underline, strikethrough, superscript, subscript, inline code
           */
          format: {
            type: 'buttons',
            order: 20,
          },

          /**
           * alignment:
           * left, center, right, justify
           */
          align: {
            type: 'buttons',
            order: 30,
          },

          /**
           * indentation:
           * increase, decrease
           */
          indent: {
            type: 'buttons',
            order: 40,
          },

          /**
           * features:
           * links, blockquote, hr, code */
          features: {
            type: 'buttons',
            order: 40,
          },

          /**
           * custom blocks:
           */
          add: {
            type: 'dropdown',
            order: 50,
          },
        },
        disableIfParentHasFixedToolbar: true,
      }), // BlocksFeature(),
      InlineToolbarFeature(),
      // TreeViewFeature(),
      EXPERIMENTAL_TableFeature(),
      // TextStateFeature(),
    ],
  }),
  db: mongooseAdapter({
    url: process.env.DATABASE_URL,
  }),
  collections: COLLECTIONS,
  debug: process.env.NODE_ENV !== 'production',
  email: useSendAdapter({
    apiKey: process.env.USESEND_API_KEY,
    useSendUrl: process.env.USESEND_URL,
    defaultFromAddress: process.env.USESEND_DEFAULT_FROM_ADDRESS,
    defaultFromName: process.env.USESEND_DEFAULT_FROM_NAME,
  }),
  endpoints: [],
  globals: GLOBALS,
  kv: redisKVAdapter({
    redisURL: process.env.REDIS_URL,
  }),
  localization: {
    locales: [
      {
        label: 'English',
        code: 'en',
      },
      {
        label: 'German',
        code: 'de',
      },
    ],
    defaultLocale: 'en',
    fallback: true,
  },
  plugins: [
    nestedDocsPlugin({
      collections: [CollectionSlug.BlogCategories],
      generateLabel: (_, { title }: Pick<BlogCategory, 'title'>) => title,
      generateURL: (_, { slug }: Pick<BlogCategory, 'slug'>, { slug: collection }) => generateContentURL({ collection, slug }).toString(),
      parentFieldSlug: 'parent',
      breadcrumbsFieldSlug: 'breadcrumbs',
    }),
    s3Storage({
      enabled: true,
      collections: {
        [CollectionSlug.MediaImages]: {
          prefix: 'images',
        },
        [CollectionSlug.MediaVideos]: {
          prefix: 'videos',
          signedDownloads: {
            shouldUseSignedURL: ({ filename }) => {
              return filename.endsWith('.mp4')
            },
            expiresIn: 3600,
          },
        },
        [CollectionSlug.MediaDocuments]: {
          prefix: 'documents',
        },
        [CollectionSlug.MediaAudio]: {
          prefix: 'audios',
        },
      },
      bucket: process.env.S3_BUCKET,

      config: {
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY!,
          secretAccessKey: process.env.S3_SECRET_KEY!,
        },
        forcePathStyle: true,
        endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
        region: process.env.S3_REGION,
      },
    }),
  ],
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL,
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  telemetry: false,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})

export default config
