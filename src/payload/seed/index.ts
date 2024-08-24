import type { CollectionSlug, GlobalSlug, Payload, PayloadRequest } from 'payload'

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import { contactForm as contactFormData } from './contact-form'
import { contact as contactPageData } from './contact-page'
import { home } from './home'
import { image1 } from './image-1'
import { image2 } from './image-2'
import { post1 } from './post-1'
import { post2 } from './post-2'
import { post3 } from './post-3'
import { Media } from '@payload-types'
import { templateBlocks } from './template-blocks'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const collections: CollectionSlug[] = [
  'categories',
  'media',
  'pages',
  'posts',
  'forms',
  'form-submissions',
]
const globals: GlobalSlug[] = ['header', 'footer']

// Next.js revalidation errors are normal when seeding the database without a server running
// i.e. running `yarn seed` locally instead of using the admin UI within an active app
// The app is not running to revalidate the pages and so the API routes are not available
// These error messages can be ignored: `Error hitting revalidate route for...`
export const seed = async ({
  payload,
  req,
}: {
  payload: Payload
  req: PayloadRequest
}): Promise<void> => {
  payload.logger.info('Seeding database...')

  // we need to clear the media directory before seeding
  // as well as the collections and globals
  // this is because while `yarn seed` drops the database
  // the custom `/api/seed` endpoint does not

  payload.logger.info(`— Clearing media...`)

  const mediaDir = path.resolve(dirname, '../../public/media')
  if (fs.existsSync(mediaDir)) {
    fs.rmdirSync(mediaDir, { recursive: true })
  }

  payload.logger.info(`— Clearing collections and globals...`)

  // clear the database
  for (const global of globals) {
    await payload.updateGlobal({
      slug: global,
      data: {
        navItems: [],
      },
      req,
    })
  }

  for (const collection of collections) {
    console.log('delete', collection)
    await payload.delete({
      collection: collection,
      where: {
        id: {
          exists: true,
        },
      },
      req,
    })
  }

  const pages = await payload.delete({
    collection: 'pages',
    where: {},
    req,
  })

  console.log({ pages })

  payload.logger.info(`— Seeding demo author and user...`)

  await payload.delete({
    collection: 'users',
    where: {
      email: {
        equals: 'demo-author@payloadcms.com',
      },
    },
    req,
  })

  const demoAuthor = await payload.create({
    collection: 'users',
    data: {
      name: 'Demo Author',
      email: 'demo-author@payloadcms.com',
      password: 'password',
    },
    req,
  })

  let demoAuthorID: number | string = demoAuthor.id

  payload.logger.info(`— Seeding media...`)
  const image1Doc = await payload.create({
    collection: 'media',
    data: image1,
    filePath: path.resolve(dirname, 'media/image-post1.webp'),
    req,
  })
  const image2Doc = await payload.create({
    collection: 'media',
    data: image2,
    filePath: path.resolve(dirname, 'media/image-post2.webp'),
    req,
  })
  const image3Doc = await payload.create({
    collection: 'media',
    data: image2,
    filePath: path.resolve(dirname, 'media/image-post3.webp'),
    req,
  })
  const imageHomeDoc = await payload.create({
    collection: 'media',
    data: image2,
    filePath: path.resolve(dirname, 'media/image-hero1.webp'),
    req,
  })
  const brandLogos: Media[] = await [
    {
      data: { alt: 'Logo: 11 Freunde' },
      filePath: path.resolve(dirname, 'media/logo_11freunde.svg'),
    },
    {
      data: { alt: 'Logo: Aktion Mensch' },
      filePath: path.resolve(dirname, 'media/logo_aktionmensch.svg'),
    },
    {
      data: { alt: 'Logo: EDEKA' },
      filePath: path.resolve(dirname, 'media/logo_edeka.svg'),
    },
    {
      data: { alt: 'Logo: Empto' },
      filePath: path.resolve(dirname, 'media/logo_empto.svg'),
    },
    {
      data: { alt: 'Logo: Filmszene Köln' },
      filePath: path.resolve(dirname, 'media/logo_filmszene.svg'),
    },
    {
      data: { alt: 'Logo: Geberit' },
      filePath: path.resolve(dirname, 'media/logo_geberit.svg'),
    },
    {
      data: { alt: 'Logo: INTRO Magazin' },
      filePath: path.resolve(dirname, 'media/logo_intro.svg'),
    },
    {
      data: { alt: 'Logo: OBI' },
      filePath: path.resolve(dirname, 'media/logo_obi.svg'),
    },
    {
      data: { alt: 'Logo: Sage' },
      filePath: path.resolve(dirname, 'media/logo_sage.svg'),
    },
    {
      data: { alt: 'Logo: Splash' },
      filePath: path.resolve(dirname, 'media/logo_splash.svg'),
    },
    {
      data: { alt: 'Logo: T-Systems' },
      filePath: path.resolve(dirname, 'media/logo_t-systems.svg'),
    },
  ].reduce(async (prev, curr) => {
    const prevValue = await prev
    const currValue = await payload.create({
      collection: 'media',
      ...curr,
      req,
    })
    return [...prevValue, currValue]
  }, Promise.resolve([]))

  payload.logger.info(`— Seeding categories...`)
  const technologyCategory = await payload.create({
    collection: 'categories',
    data: {
      title: 'Technology',
    },
    req,
  })

  const newsCategory = await payload.create({
    collection: 'categories',
    data: {
      title: 'News',
    },
    req,
  })

  const financeCategory = await payload.create({
    collection: 'categories',
    data: {
      title: 'Finance',
    },
    req,
  })

  await payload.create({
    collection: 'categories',
    data: {
      title: 'Design',
    },
    req,
  })

  await payload.create({
    collection: 'categories',
    data: {
      title: 'Software',
    },
    req,
  })

  await payload.create({
    collection: 'categories',
    data: {
      title: 'Engineering',
    },
    req,
  })

  let image1ID: number | string = image1Doc.id
  let image2ID: number | string = image2Doc.id
  let image3ID: number | string = image3Doc.id
  let imageHomeID: number | string = imageHomeDoc.id

  if (payload.db.defaultIDType === 'text') {
    image1ID = `"${image1Doc.id}"`
    image2ID = `"${image2Doc.id}"`
    image3ID = `"${image3Doc.id}"`
    imageHomeID = `"${imageHomeDoc.id}"`
    demoAuthorID = `"${demoAuthorID}"`
  }

  payload.logger.info(`— Seeding posts...`)

  // Do not create posts with `Promise.all` because we want the posts to be created in order
  // This way we can sort them by `createdAt` or `publishedAt` and they will be in the expected order
  const post1Doc = await payload.create({
    collection: 'posts',
    data: JSON.parse(
      JSON.stringify({ ...post1, categories: [technologyCategory.id] })
        .replace(/"\{\{IMAGE_1\}\}"/g, String(image1ID))
        .replace(/"\{\{IMAGE_2\}\}"/g, String(image2ID))
        .replace(/"\{\{AUTHOR\}\}"/g, String(demoAuthorID)),
    ),
    req,
  })

  const post2Doc = await payload.create({
    collection: 'posts',
    data: JSON.parse(
      JSON.stringify({ ...post2, categories: [newsCategory.id] })
        .replace(/"\{\{IMAGE_1\}\}"/g, String(image2ID))
        .replace(/"\{\{IMAGE_2\}\}"/g, String(image3ID))
        .replace(/"\{\{AUTHOR\}\}"/g, String(demoAuthorID)),
    ),
    req,
  })

  const post3Doc = await payload.create({
    collection: 'posts',
    data: JSON.parse(
      JSON.stringify({ ...post3, categories: [financeCategory.id] })
        .replace(/"\{\{IMAGE_1\}\}"/g, String(image3ID))
        .replace(/"\{\{IMAGE_2\}\}"/g, String(image1ID))
        .replace(/"\{\{AUTHOR\}\}"/g, String(demoAuthorID)),
    ),
    req,
  })

  // update each post with related posts
  await payload.update({
    id: post1Doc.id,
    collection: 'posts',
    data: {
      relatedPosts: [post2Doc.id, post3Doc.id],
    },
    req,
  })
  await payload.update({
    id: post2Doc.id,
    collection: 'posts',
    data: {
      relatedPosts: [post1Doc.id, post3Doc.id],
    },
    req,
  })
  await payload.update({
    id: post3Doc.id,
    collection: 'posts',
    data: {
      relatedPosts: [post1Doc.id, post2Doc.id],
    },
    req,
  })

  payload.logger.info(`— Seeding home page...`)
  const brandLogoEntries = JSON.stringify(brandLogos.map(({ id }) => ({ logo: id })))
  const homeData = JSON.parse(
    JSON.stringify(home)
      .replace(/"\{\{IMAGE_1\}\}"/g, String(imageHomeID))
      .replace(/"\{\{BRAND_LOGO_ENTRIES\}\}"/g, brandLogoEntries)
      .replace(/"\{\{IMAGE_2\}\}"/g, String(image2ID)),
  )

  await payload.create({
    collection: 'pages',
    data: homeData,
    req,
  })

  payload.logger.info(`— Seeding template blocks...`)
  const templateBlocksData = JSON.parse(
    JSON.stringify(templateBlocks)
      .replace(/"\{\{IMAGE_1\}\}"/g, String(imageHomeID))
      .replace(/"\{\{IMAGE_2\}\}"/g, String(image2ID)),
  )

  const templateBlocksPage = await payload.create({
    collection: 'pages',
    data: templateBlocksData,
    req,
  })

  payload.logger.info(`— Seeding contact form...`)

  const contactForm = await payload.create({
    collection: 'forms',
    data: JSON.parse(JSON.stringify(contactFormData)),
    req,
  })

  let contactFormID: number | string = contactForm.id

  if (payload.db.defaultIDType === 'text') {
    contactFormID = `"${contactFormID}"`
  }

  payload.logger.info(`— Seeding contact page...`)

  const contactPage = await payload.create({
    collection: 'pages',
    data: JSON.parse(
      JSON.stringify(contactPageData).replace(/"\{\{CONTACT_FORM_ID\}\}"/g, String(contactFormID)),
    ),
    req,
  })

  payload.logger.info(`— Seeding header...`)

  await payload.updateGlobal({
    slug: 'header',
    data: {
      navItems: [
        {
          link: {
            type: 'reference',
            label: 'Template Blocks',
            reference: {
              relationTo: 'pages',
              value: templateBlocksPage.id,
            },
          },
        },
        {
          link: {
            type: 'custom',
            label: 'Posts',
            url: '/posts',
          },
        },
        {
          link: {
            type: 'reference',
            label: 'Contact',
            reference: {
              relationTo: 'pages',
              value: contactPage.id,
            },
          },
        },
      ],
    },
    req,
  })

  payload.logger.info(`— Seeding footer...`)

  await payload.updateGlobal({
    slug: 'footer',
    data: {
      navItems: [
        {
          link: {
            type: 'custom',
            label: 'Admin',
            url: '/admin',
          },
        },
        {
          link: {
            type: 'custom',
            label: 'Source Code',
            newTab: true,
            url: 'https://github.com/payloadcms/payload/tree/beta/templates/website',
          },
        },
        {
          link: {
            type: 'custom',
            label: 'Payload',
            newTab: true,
            url: 'https://payloadcms.com/',
          },
        },
      ],
    },
    req,
  })

  payload.logger.info('Seeded database successfully!')
}
