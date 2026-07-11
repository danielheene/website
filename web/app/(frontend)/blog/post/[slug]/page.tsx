// biome-ignore-all lint: reason

import { cache } from 'react'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import config from '@payload-config'
import { getPayload } from 'payload'

import { generateMeta } from '@/lib/generateMeta'
import { generateBlogPosting, generateBreadcrumbList } from '@/lib/jsonLd'
import { CollectionSlug, CollectionData } from '@/types/collections'
import { resolveRelations } from '@/lib/resolveRelation'
import { reduceDataToLocale } from '@/lib/i18n'

export async function generateStaticParams() {
  const payload = await getPayload({
    config,
  })

  const { docs = [] } = await payload.find({
    collection: CollectionSlug['BlogPosts'],
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  return docs.map(({ slug }) => ({
    slug,
  }))
}

type PageProps = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Page({ params: paramsPromise }: PageProps) {
  const { slug } = await paramsPromise

  const post = await queryPostBySlug({
    slug,
  })
  if (!post) return notFound()

  const { title, content, heroImage, createdAt, updatedAt, tags } = post
  const baseUrl = process.env.SERVER_URL || 'https://danielheene.de'
  const postUrl = `${baseUrl}/posts/${slug}`

  const heroData = heroImage?.value;
  const heroImageData = heroData?.url
    ? {
      url:    new URL(new URL(heroData.url).pathname, baseUrl).toString(),
      width: heroData.width || undefined,
      height: heroData.height || undefined,
      alt: heroData.alt || title,
    }
    : undefined
  //
  // // Extract keywords from tags
  // const postTags = tags
  //   ? tags.map((tag) => (typeof tag === 'object' ? (tag as BlogTag).title : '')).filter(Boolean)
  //   : undefined

  // Get category name for breadcrumb
  // const category =
  //   typeof categories === 'object' ? (categories as BlogCategory) : null
  // const categoryName = category?.title || 'Blog'
  // const categorySlug = category?.slug || ''

  // Generate BlogPosting schema
  const blogPostingSchema = generateBlogPosting({
    headline: title,
    url: postUrl,
    datePublished: createdAt,
    dateModified: updatedAt || createdAt,
    image: heroImageData,
    author: {
      name: 'Daniel Heene',
      url: baseUrl,
    },
    // keywords: postTags,
  })

  // Generate BreadcrumbList schema
  const breadcrumbSchema = generateBreadcrumbList([
    {
      name: 'Home',
      url: baseUrl,
    },
    // {
    //   name: categoryName,
    //   url: `${baseUrl}/categories/${categorySlug}`,
    // },
    {
      name: title,
    },
  ])

  return (
    <div
      className="flex min-h-svh w-full flex-col bg-background text-foreground"
      id="screenshot"
      data-theme-scope="preview"
    >
      <div className="flex flex-1 items-center justify-center">
        <section className="pb-32 w-full">
          <div
            className="bg-muted bg-[url('https://deifkwefumgah.cloudfront.net/shadcnblocks/block/patterns/dot-pattern-2.svg')] bg-[length:3.125rem_3.125rem] bg-repeat py-20">
            <div
              className="container flex flex-col items-start justify-start gap-16 py-20 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex w-full flex-col items-center justify-center gap-12">
                <div className="flex w-full max-w-[36rem] flex-col items-center justify-center gap-8">
                  <nav aria-label="breadcrumb" data-slot="breadcrumb" className="">
                    <ol
                      data-slot="breadcrumb-list"
                      className="text-muted-foreground gap-1.5 text-sm sm:gap-2.5 flex flex-wrap items-center wrap-break-word"
                    >
                      <li data-slot="breadcrumb-item" className="gap-1.5 inline-flex items-center">
                        <a
                          data-slot="breadcrumb-link"
                          className="hover:text-foreground transition-colors"
                          href="#"
                        >
                          Resources
                        </a>
                      </li>
                      <li
                        data-slot="breadcrumb-separator"
                        role="presentation"
                        aria-hidden="true"
                        className="[&>svg]:size-3.5"
                      >
                        /
                      </li>
                      <li data-slot="breadcrumb-item" className="gap-1.5 inline-flex items-center">
                        <a
                          data-slot="breadcrumb-link"
                          className="hover:text-foreground transition-colors"
                          // biome-ignore lint/a11y/useValidAnchor: <explanation>
                          href="#"
                        >
                          Blogs
                        </a>
                      </li>
                    </ol>
                  </nav>
                  <div className="flex w-full flex-col gap-5">
                    <div className="flex items-center justify-center gap-2.5 text-sm font-medium text-foreground/60">
                      <div>10 min read</div>
                      <div>|</div>
                      <div>May 18, 2025</div>
                    </div>
                    <h1 className="text-center text-[2.5rem] leading-[1.2] font-semibold md:text-5xl lg:text-6xl">
                      Building Better Components
                    </h1>
                    <p className="text-center text-xl leading-[1.4] font-semibold text-foreground">
                      The best blog is one that captivates readers with engaging, well-researched
                      content presented in a clear and relatable way.
                    </p>
                    <div className="flex items-center justify-center gap-2.5">
                      {/** biome-ignore lint/a11y/useAnchorContent: <explanation> */}
                      <a
                        href="#"
                        data-slot="button"
                        data-variant="default"
                        data-size="icon"
                        className="focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-error/20 dark:aria-invalid:ring-error/40 aria-invalid:border-error dark:aria-invalid:border-error/50 rounded-md border border-transparent bg-clip-padding text-sm font-medium focus-visible:ring-3 aria-invalid:ring-3 [&_svg:not([class*='size-'])]:size-4 inline-flex items-center justify-center whitespace-nowrap transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none shrink-0 [&_svg]:shrink-0 outline-none group/button select-none bg-primary text-primary-foreground hover:bg-primary/80 size-9"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width={24}
                          height={24}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-twitter"
                          aria-hidden="true"
                        >
                          <path
                            d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                        </svg>
                      </a>
                      {/** biome-ignore lint/a11y/useAnchorContent: <explanation> */}
                      <a
                        href="#"
                        data-slot="button"
                        data-variant="default"
                        data-size="icon"
                        className="focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-error/20 dark:aria-invalid:ring-error/40 aria-invalid:border-error dark:aria-invalid:border-error/50 rounded-md border border-transparent bg-clip-padding text-sm font-medium focus-visible:ring-3 aria-invalid:ring-3 [&_svg:not([class*='size-'])]:size-4 inline-flex items-center justify-center whitespace-nowrap transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none shrink-0 [&_svg]:shrink-0 outline-none group/button select-none bg-primary text-primary-foreground hover:bg-primary/80 size-9"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width={24}
                          height={24}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-linkedin"
                          aria-hidden="true"
                        >
                          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                          <rect width={4} height={12} x={2} y={9} />
                          <circle cx={4} cy={4} r={2} />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="container pt-20">
            <div className="relative mx-auto w-full max-w-5xl items-start justify-between gap-20 lg:flex">
              <div className="top-20 flex-1 bg-background pb-10 lg:sticky lg:pb-0">
                <div className="text-xl leading-snug font-medium">Chapters</div>
                <div className="flex flex-col gap-2 pt-2 pl-2">
                  <a
                    href="#heading-1"
                    className="block text-sm leading-normal font-medium text-muted-foreground transition duration-300 text-muted-foreground"
                  >
                    The Role of UI Components in Development
                  </a>
                  <a
                    href="#heading-2"
                    className="block text-sm leading-normal font-medium text-muted-foreground transition duration-300 lg:rounded-md lg:bg-muted lg:p-2 lg:font-bold lg:!text-primary"
                  >
                    Core Types of UI Components
                  </a>
                  <a
                    href="#heading-3"
                    className="block text-sm leading-normal font-medium text-muted-foreground transition duration-300 text-muted-foreground"
                  >
                    End Paragraph
                  </a>
                </div>
              </div>
              <div className="flex w-full max-w-[40rem] flex-col gap-10">
                <div className="flex items-center gap-2.5">
                  <span
                    data-slot="avatar"
                    data-size="default"
                    className="rounded-full after:rounded-full data-[size=lg]:size-10 data-[size=sm]:size-6 after:border-border group/avatar relative flex shrink-0 select-none after:absolute after:inset-0 after:border after:mix-blend-darken dark:after:mix-blend-lighten size-12 border"
                  >
                    <img
                      data-slot="avatar-image"
                      className="rounded-full aspect-square size-full object-cover"
                      alt="Jane Doe"
                      src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-1.webp"
                    />
                  </span>
                  <div>
                    <div className="text-sm leading-normal font-normal">Jane Doe</div>
                    <div className="text-sm leading-normal font-normal text-muted-foreground">
                      CEO &amp; Cofounder
                    </div>
                  </div>
                </div>
                <div className="prose dark:prose-invert">
                  <h2>Key Takeaways</h2>
                  <p>
                    - UI components are foundational, reusable elements in web development that
                    encapsulate both design and behavior to promote consistency and efficiency.
                  </p>
                  <p>
                    - Leveraging component libraries and frameworks streamlines the development
                    process and ensures accessibility and cross-device compatibility.
                  </p>
                  <p>
                    - Understanding different types of UI components enables developers to create
                    structured, scalable, and maintainable user interfaces.
                  </p>
                  <p>
                    In the evolving landscape of modern web development, UI components have emerged
                    as indispensable tools for crafting user-friendly interfaces. These components,
                    ranging from simple buttons to complex data tables, are the building blocks that
                    help shape the overall user experience. By modularizing the interface into
                    smaller, manageable pieces, UI components not only streamline the development
                    process but also promote consistency across an application's design. As digital
                    products become more complex, the role of well-structured UI components becomes
                    even more critical in meeting user expectations and maintaining code quality.
                  </p>
                  <h2 id="heading-1" className="scroll-mt-24">
                    The Role of UI Components in Development
                  </h2>
                  <p>
                    UI components serve as self-contained units of functionality and presentation,
                    often designed to be reused across multiple parts of an application. By
                    encapsulating both logic and styling, components reduce duplication and improve
                    the maintainability of codebases. For example, a single button component can be
                    reused with different props or styles, ensuring a uniform look and feel
                    throughout the application. This modular approach also allows for parallel
                    development, where teams can work on separate components without interfering
                    with each other's work.
                  </p>
                  <p>
                    Popular frameworks like React, Vue, and Angular are built around component-based
                    architectures, encouraging developers to think in terms of reusable blocks
                    rather than monolithic pages. This shift not only enhances scalability but also
                    simplifies testing and debugging. Additionally, many UI libraries such as
                    Material UI, Chakra UI, and Radix UI provide pre-built, accessible components
                    that accelerate development and ensure consistency with design systems.
                    Embracing components as first-class citizens in frontend architecture leads to
                    better code organization, faster prototyping, and a more seamless user
                    experience.
                  </p>
                  <h2 id="heading-2" className="scroll-mt-24">
                    Core Types of UI Components
                  </h2>
                  <h3>1. Input Components</h3>
                  <p>
                    Input components are interactive elements that allow users to provide
                    information. These include text inputs, checkboxes, radio buttons, sliders, and
                    file upload fields. They are essential in forms and user settings, enabling data
                    collection and customization. A well-designed input component handles
                    validation, displays feedback, and provides a seamless experience across
                    different devices and screen readers, ensuring inclusivity and usability.
                  </p>
                  <a href="#">Explore more</a>
                  <div className="w-full max-w-[40rem] overflow-hidden">
                    <img
                      alt=""
                      className="size-full object-cover object-center"
                      src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-1.svg"
                    />
                  </div>
                  <h3>2. Navigation Components</h3>
                  <p>
                    Navigation components guide users through an application's structure. These
                    include elements like top bars, side menus, breadcrumbs, tabs, and pagination.
                    Effective navigation improves discoverability and helps users find the content
                    they need without friction. Good navigation design considers user flow,
                    accessibility (such as keyboard navigation and ARIA labels), and responsiveness,
                    ensuring the interface is intuitive and adaptive to various screen sizes.
                  </p>
                  <div className="w-full max-w-[40rem] overflow-hidden">
                    <img
                      alt=""
                      className="size-full object-cover object-center"
                      src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-2.svg"
                    />
                  </div>
                  <h3>3. Feedback Components</h3>
                  <p>
                    Feedback components provide users with visual or textual cues in response to
                    their actions. Examples include modals, toast notifications, progress bars, and
                    tooltips. These elements inform users about the success or failure of their
                    operations or alert them to required actions. They enhance interactivity and
                    reduce confusion, especially when performing asynchronous actions like form
                    submissions or file uploads.
                  </p>
                  <div className="w-full max-w-[40rem] overflow-hidden">
                    <img
                      alt=""
                      className="size-full object-cover object-center"
                      src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-3.svg"
                    />
                  </div>
                  <h3>4. Layout Components</h3>
                  <p>
                    Layout components organize content visually on the page. Common examples include
                    containers, rows, columns, and grid systems. These components help define the
                    structure of a page and control the spacing, alignment, and responsiveness of
                    child elements. A strong layout system ensures consistency in visual hierarchy
                    and supports scalability as the application grows in complexity.
                  </p>
                  <div className="w-full max-w-[40rem] overflow-hidden">
                    <img
                      alt=""
                      className="size-full object-cover object-center"
                      src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-4.svg"
                    />
                  </div>
                  <h2 id="heading-3" className="scroll-mt-24">
                    End Paragraph
                  </h2>
                  <p>
                    Mastering the use of UI components is a key step toward building reliable,
                    scalable, and aesthetically consistent web applications. By breaking down
                    interfaces into smaller parts, developers can achieve greater flexibility,
                    encourage reuse, and reduce the likelihood of errors. UI components also bridge
                    the gap between design and development, creating a more collaborative and
                    efficient workflow that benefits both developers and end users.
                  </p>
                </div>
                <div className="prose rounded-lg bg-muted p-5 dark:prose-invert [&>h2]:mt-0">
                  <h2>Conclusion</h2>
                  <p>
                    UI components are more than just visual elements—they are strategic assets in a
                    modern developer's toolkit. When designed thoughtfully and used effectively,
                    they empower teams to deliver high-quality interfaces with speed, consistency,
                    and confidence. As frontend development continues to evolve, investing in
                    reusable, accessible, and well-documented UI components will remain essential
                    for building user-centric, maintainable digital products.
                  </p>
                </div>
                <div className="flex flex-col gap-4 rounded-lg bg-muted p-5">
                  §{' '}
                  <div className="flex items-center gap-2.5">
                    <span
                      data-slot="avatar"
                      data-size="default"
                      className="rounded-full after:rounded-full data-[size=lg]:size-10 data-[size=sm]:size-6 after:border-border group/avatar relative flex shrink-0 select-none after:absolute after:inset-0 after:border after:mix-blend-darken dark:after:mix-blend-lighten size-12 border"
                    >
                      <img
                        data-slot="avatar-image"
                        className="rounded-full aspect-square size-full object-cover"
                        alt="Jane Doe"
                        src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-1.webp"
                      />
                    </span>
                    <div>
                      <div className="text-sm leading-normal font-normal">Jane Doe</div>
                      <div className="text-sm leading-normal font-normal text-muted-foreground">
                        CEO &amp; Cofounder
                      </div>
                    </div>
                  </div>
                  <p>
                    An avid storyteller with a passion for crafting compelling narratives, love to
                    explore the human experience through vivid characters and thought-provoking
                    themes.{' '}
                  </p>
                  <div className="flex items-center gap-2.5">
                    <a
                      href="#"
                      data-slot="button"
                      data-variant="default"
                      data-size="icon"
                      className="focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-error/20 dark:aria-invalid:ring-error/40 aria-invalid:border-error dark:aria-invalid:border-error/50 rounded-md border border-transparent bg-clip-padding text-sm font-medium focus-visible:ring-3 aria-invalid:ring-3 [&_svg:not([class*='size-'])]:size-4 inline-flex items-center justify-center whitespace-nowrap transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none shrink-0 [&_svg]:shrink-0 outline-none group/button select-none bg-primary text-primary-foreground hover:bg-primary/80 size-9"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={24}
                        height={24}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-twitter"
                        aria-hidden="true"
                      >
                        <path
                          d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                      </svg>
                    </a>
                    <a
                      href="#"
                      data-slot="button"
                      data-variant="default"
                      data-size="icon"
                      className="focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-error/20 dark:aria-invalid:ring-error/40 aria-invalid:border-error dark:aria-invalid:border-error/50 rounded-md border border-transparent bg-clip-padding text-sm font-medium focus-visible:ring-3 aria-invalid:ring-3 [&_svg:not([class*='size-'])]:size-4 inline-flex items-center justify-center whitespace-nowrap transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none shrink-0 [&_svg]:shrink-0 outline-none group/button select-none bg-primary text-primary-foreground hover:bg-primary/80 size-9"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={24}
                        height={24}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-linkedin"
                        aria-hidden="true"
                      >
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                        <rect width={4} height={12} x={2} y={9} />
                        <circle cx={4} cy={4} r={2} />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export async function generateMetadata({ params: paramsPromise }: PageProps): Promise<Metadata> {
  const { slug } = await paramsPromise
  const doc = await queryPostBySlug({
    slug,
  })
  return generateMeta({
    doc,
  })
}

const queryPostBySlug = cache(async ({ slug }: {
  slug: string
}): Promise<CollectionData<CollectionSlug['BlogPosts']>> => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({
    config,
  })

  const { docs = [] } = await payload.find({
    collection: CollectionSlug['BlogPosts'],
    draft,
    limit: 1,
    pagination: false,
    overrideAccess: draft,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  if (!docs[0]) return null


  return reduceDataToLocale(await resolveRelations(docs[0]))
})
