import type { ImageObjectLeaf, PersonLeaf, Thing } from 'schema-dts'

import { RESUME_PAGE_SLUG } from '@/collections/Pages/constants'
import { generateContentURL } from '@/lib/generateContentURL'
import { isMediaFile } from '@/lib/typeGuards'
import { CollectionSlug } from '@/types/collections'

import { generateBlog } from './generateBlog'
import { generateBlogPosting } from './generateBlogPosting'
import { type BreadcrumbItem, generateBreadcrumbList } from './generateBreadcrumbList'
import { generateCreativeWork } from './generateCreativeWork'
import { type DocumentFile, generateDigitalDocument } from './generateDigitalDocument'
import { generateItemList } from './generateItemList'
import { generateOccupation } from './generateOccupation'
import { generateWebPage } from './generateWebPage'
import { jsonLdIds } from './ids'
import { heroImageObjects, isImageLike, lexicalToText, toImageObject } from './imageObject'

/**
 * A populated relation's document, or undefined for a bare id. The callers
 * only read optional properties, so a document of another shape yields nothing.
 */
const related = <T>(entry: { value?: unknown } | null | undefined): T | undefined =>
  // SAFETY: an object here is a populated document; see above for why T is safe.
  entry?.value && typeof entry.value === 'object' ? (entry.value as T) : undefined

const titles = (entries: { value?: unknown }[] | null | undefined): string[] =>
  (entries ?? []).flatMap((entry) => {
    const title = related<{ title?: string | null }>(entry)?.title?.trim()

    return title ? [title] : []
  })

const homeCrumb = (): BreadcrumbItem => ({
  name: 'Home',
  url: generateContentURL({
    path: '/',
  }),
})

/** Drops the entries a route doesn't have. */
const compact = <T>(entries: (T | false | null | undefined)[]): T[] =>
  entries.filter((entry): entry is T => Boolean(entry))

const blogCrumb = (): BreadcrumbItem => ({
  name: 'Blog',
  url: generateContentURL({
    path: '/blog',
  }),
})

export interface PageGraphInput {
  siteUrl: string
  slug: string
  title?: string | null
  description?: string | null
  hero?: {
    slides?: unknown
  } | null
  createdAt?: string | null
  updatedAt?: string | null
  /** The resume page: a profile of the site owner, like the home page. */
  isProfile?: boolean
}

/**
 * A CMS page. The home and resume pages are `ProfilePage`s about the site
 * owner; every other page gets a breadcrumb back home.
 */
export const pageGraph = (page: PageGraphInput): Thing[] => {
  const isHome = page.slug === 'home'

  const url = generateContentURL({
    collection: CollectionSlug.Pages,
    slug: page.slug,
  })

  const name = page.title || (isHome ? 'Home' : page.slug)

  return compact<Thing>([
    generateWebPage({
      type: isHome || page.isProfile ? 'ProfilePage' : 'WebPage',
      url,
      name,
      description: page.description,
      siteUrl: page.siteUrl,
      mainEntity: isHome || page.isProfile ? jsonLdIds(page.siteUrl).person : undefined,
      hasBreadcrumb: !isHome,
      image: heroImageObjects(page.hero?.slides, page.siteUrl)[0],
      datePublished: page.createdAt,
      dateModified: page.updatedAt,
    }),
    !isHome &&
      generateBreadcrumbList([
        homeCrumb(),
        {
          name,
          url,
        },
      ]),
  ])
}

export interface CareerInput {
  siteUrl: string
  jobs: {
    employer?: string | null
    title?: string | null
    startDate?: string | null
    endDate?: string | null
    tasks?: { task?: unknown }[] | null
    skillTags?: { value?: unknown }[] | null
  }[]
  skillTags: { title?: string | null }[]
  projects: {
    title?: string | null
    scope?: string | null
    description?: unknown
    relatedPost?: { value?: unknown } | null
    images?: { value?: unknown }[] | null
  }[]
}

/**
 * What the resume page adds to the site owner: the jobs held, what they know
 * about and the projects they made. The person node shares the site-wide
 * `@id`, so consumers merge it into the one person.
 */
export const careerGraph = ({ siteUrl, jobs, skillTags, projects }: CareerInput): Thing[] => {
  const ids = jsonLdIds(siteUrl)

  // /resume is a document in the pages collection; the resume-documents
  // collection only serves the generated PDFs under /resume/<slug>.
  const resumeUrl = generateContentURL({
    collection: CollectionSlug.Pages,
    slug: RESUME_PAGE_SLUG,
  })

  const person: PersonLeaf = {
    '@type': 'Person',
    '@id': ids.person,
  }

  const occupations = jobs
    .filter((job) => job.title)
    .map((job) =>
      generateOccupation({
        name: job.title,
        employer: job.employer,
        startDate: job.startDate,
        endDate: job.endDate,
        responsibilities: (job.tasks ?? []).flatMap(({ task }) => {
          const text = lexicalToText(task)

          return text ? [text] : []
        }),
        skills: titles(job.skillTags),
      }),
    )

  if (occupations.length > 0) person.hasOccupation = occupations

  const knowsAbout = skillTags.flatMap(({ title }) => (title?.trim() ? [title.trim()] : []))

  if (knowsAbout.length > 0) person.knowsAbout = knowsAbout

  const works = projects
    .filter((project) => project.title)
    .map((project) => {
      const post = related<{ slug?: string | null }>(project.relatedPost)

      const image = (project.images ?? []).map((entry) => related<unknown>(entry)).find(isImageLike)

      return generateCreativeWork({
        siteUrl,
        name: project.title,
        scope: project.scope,
        description: lexicalToText(project.description),
        url: post?.slug
          ? generateContentURL({
              collection: CollectionSlug.BlogPosts,
              slug: post.slug,
            })
          : undefined,
        image: image ? toImageObject(image, siteUrl) : undefined,
      })
    })

  return compact<Thing>([
    person,
    works.length > 0 && {
      ...generateItemList(`${resumeUrl}#projects`, works),
      name: 'Projects',
    },
  ])
}

export interface PostGraphInput {
  siteUrl: string
  slug: string
  title: string
  description?: string | null
  excerpt?: unknown
  createdAt: string
  updatedAt?: string | null
  hero?: {
    slides?: unknown
  } | null
  topics?: { value?: unknown }[] | null
  wordCount?: number | null
  readingTime?: number | null
  /** The post's Open Graph card, made absolute. */
  ogImage: ImageObjectLeaf
}

/** A blog post, its page and its trail through the blog and primary topic. */
export const postGraph = (post: PostGraphInput): Thing[] => {
  const url = generateContentURL({
    collection: CollectionSlug.BlogPosts,
    slug: post.slug,
  })

  const topics = (post.topics ?? []).flatMap((entry) => {
    const topic = related<{ title?: string | null; slug?: string | null }>(entry)

    return topic?.title && topic.slug ? [topic as { title: string; slug: string }] : []
  })

  const description = post.description?.trim() || lexicalToText(post.excerpt)
  const images = [...heroImageObjects(post.hero?.slides, post.siteUrl), post.ogImage]
  const [primaryTopic] = topics

  return [
    generateWebPage({
      url,
      name: post.title,
      description,
      siteUrl: post.siteUrl,
      mainEntity: `${url}#article`,
      hasBreadcrumb: true,
      image: images[0],
      datePublished: post.createdAt,
      dateModified: post.updatedAt,
    }),
    generateBlogPosting({
      siteUrl: post.siteUrl,
      url,
      headline: post.title,
      description,
      datePublished: post.createdAt,
      dateModified: post.updatedAt,
      images,
      topics: topics.map(({ title }) => title),
      wordCount: post.wordCount,
      readingTime: post.readingTime,
    }),
    generateBreadcrumbList(
      compact([
        homeCrumb(),
        blogCrumb(),
        primaryTopic && {
          name: primaryTopic.title,
          url: generateContentURL({
            collection: CollectionSlug.BlogTopics,
            slug: primaryTopic.slug,
          }),
        },
        {
          name: post.title,
          url,
        },
      ]),
    ),
  ]
}

export interface BlogListingGraphInput {
  siteUrl: string
  /** The site description, used for the blog itself. */
  blogDescription?: string | null
  topic?: {
    slug: string
    title: string
    description?: string | null
    content?: unknown
    hero?: {
      slides?: unknown
    } | null
  } | null
}

/** The blog listing, or one topic's listing within it. */
export const blogListingGraph = ({
  siteUrl,
  blogDescription,
  topic,
}: BlogListingGraphInput): Thing[] => {
  const blogUrl = blogCrumb().url

  const url = topic
    ? generateContentURL({
        collection: CollectionSlug.BlogTopics,
        slug: topic.slug,
      })
    : blogUrl

  return [
    generateWebPage({
      type: 'CollectionPage',
      url,
      name: topic?.title ?? 'Blog',
      description: topic
        ? topic.description?.trim() || lexicalToText(topic.content)
        : blogDescription,
      siteUrl,
      mainEntity: topic ? `${url}#posts` : jsonLdIds(siteUrl).blog,
      hasBreadcrumb: true,
      image: heroImageObjects(topic?.hero?.slides, siteUrl)[0],
    }),
    generateBlog({
      siteUrl,
      url: blogUrl,
      name: 'Blog',
      description: blogDescription,
    }),
    generateBreadcrumbList(
      compact([
        homeCrumb(),
        blogCrumb(),
        topic && {
          name: topic.title,
          url,
        },
      ]),
    ),
  ]
}

export interface ListedPost {
  slug: string
  title?: string | null
  createdAt: string
  updatedAt?: string | null
  hero?: {
    slides?: unknown
  } | null
}

/**
 * The posts on one listing page. On a topic page the list is the page's main
 * entity; on /blog it is the blog's `blogPost`.
 */
export const listedPostsGraph = ({
  siteUrl,
  topicSlug,
  posts,
}: {
  siteUrl: string
  topicSlug?: string
  posts: ListedPost[]
}): Thing[] => {
  const ids = jsonLdIds(siteUrl)

  const postings = posts.map((post) => {
    const url = generateContentURL({
      collection: CollectionSlug.BlogPosts,
      slug: post.slug,
    })

    return generateBlogPosting({
      siteUrl,
      url,
      headline: post.title ?? post.slug,
      datePublished: post.createdAt,
      dateModified: post.updatedAt,
      images: heroImageObjects(post.hero?.slides, siteUrl).slice(0, 1),
    })
  })

  if (topicSlug) {
    const topicUrl = generateContentURL({
      collection: CollectionSlug.BlogTopics,
      slug: topicSlug,
    })

    return [generateItemList(`${topicUrl}#posts`, postings)]
  }

  return [
    {
      '@type': 'Blog',
      '@id': ids.blog,
      blogPost: postings,
    },
  ]
}

export interface ResumeDocumentGraphInput {
  siteUrl: string
  slug: string
  title?: string | null
  description: string
  createdAt?: string | null
  files: {
    language: string
    media?: unknown
    checksum?: string | null
  }[]
  thumbnail?: unknown
}

/** A generated resume PDF, under the resume page. */
export const resumeDocumentGraph = (resume: ResumeDocumentGraphInput): Thing[] => {
  const url = generateContentURL({
    collection: CollectionSlug.ResumeDocuments,
    slug: resume.slug,
  })

  const name = resume.title || 'Resume'

  const files = resume.files.flatMap(({ language, media, checksum }): DocumentFile[] =>
    isMediaFile(media) && media.url
      ? [
          {
            language,
            url: new URL(media.url, resume.siteUrl).href,
            sha256: checksum,
            bytes: media.filesize,
          },
        ]
      : [],
  )

  return [
    generateWebPage({
      url,
      name,
      description: resume.description,
      siteUrl: resume.siteUrl,
      mainEntity: `${url}#document`,
      hasBreadcrumb: true,
      datePublished: resume.createdAt,
    }),
    generateDigitalDocument({
      siteUrl: resume.siteUrl,
      url,
      name,
      description: resume.description,
      dateCreated: resume.createdAt,
      files,
      thumbnail: isImageLike(resume.thumbnail)
        ? toImageObject(resume.thumbnail, resume.siteUrl)
        : undefined,
    }),
    generateBreadcrumbList([
      homeCrumb(),
      {
        name: 'Resume',
        // the resume page itself, a pages document
        url: generateContentURL({
          collection: CollectionSlug.Pages,
          slug: RESUME_PAGE_SLUG,
        }),
      },
      {
        name,
        url,
      },
    ]),
  ]
}
