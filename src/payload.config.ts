import path from 'node:path'
import * as process from 'node:process'
import { fileURLToPath } from 'node:url'

import { CollectionSlug, BlockSlug } from '@custom-types'
import type { BlogCategory } from '@payload-types'
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
  LinkFeature,
  lexicalEditor,
  OrderedListFeature,
  ParagraphFeature,
  RelationshipFeature,
  StrikethroughFeature,
  UnderlineFeature,
  UnorderedListFeature,
  UploadFeature, BlocksFeature,
} from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { BLOCKS } from '@/blocks'
import { COLLECTIONS } from '@/collections'
import { LinkField } from '@/fields/Link'
import { GLOBALS } from '@/globals'
import { generateContentURL } from '@/lib/generateContentURL'
import { useSendAdapter } from '@/utilities/useSendAdapter'
import { TwoColumnContentBlock } from '@/blocks/TwoColumnContentBlock'

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
      providers: ['@/contexts/UmamiCharts#UmamiChartsProvider'],
    },
    dashboard: {
      defaultLayout: [
        { widgetSlug: 'umami-control-bar', width: 'full' },
        { widgetSlug: 'umami-stats-widget', width: 'full' },
        { widgetSlug: 'umami-pageviews-widget', width: 'medium' },
        { widgetSlug: 'umami-paths-widget', width: 'x-small' },
        { widgetSlug: 'umami-events-widget', width: 'x-small' },
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
        fields: LinkField().fields,
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
      }),
      BlocksFeature({
        blocks: [
          BlockSlug.LinkGroup,
        ],
      }),
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
      generateURL: (_, { slug }: Pick<BlogCategory, 'slug'>, { slug: collection }) => generateContentURL({
        collection,
        slug,
      }),
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
        [CollectionSlug.MediaAudios]: {
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
