import { cache } from 'react'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import config from '@payload-config'
import { getPayload } from 'payload'

import { generateMeta } from '@/lib/generateMeta'
import { CollectionSlug } from '@/types/collections'

export async function generateStaticParams() {
  const payload = await getPayload({
    config,
  })
  const { docs = [] } = await payload.find({
    collection: CollectionSlug['BlogTags'],
    pagination: false,
    select: {
      slug: true,
    },
  })

  console.log('docs', docs)

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

  const tag = await queryTagBySlug({
    slug,
  })

  //
  // const { title, content } = tag
  //
  // const baseUrl = process.env.SERVER_URL || 'https://danielheene.de'
  // const tagUrl = `${baseUrl}/tags/${slug}`
  //
  // // Generate CollectionPage schema
  // const collectionPageSchema = generateCollectionPage({
  //   name: title,
  //   url: tagUrl,
  // })
  //
  // // Generate BreadcrumbList schema
  // const breadcrumbSchema = generateBreadcrumbList([
  //   {
  //     name: 'Home',
  //     url: baseUrl,
  //   },
  //   {
  //     name: 'Tags',
  //     url: `${baseUrl}/tags`,
  //   },
  //   {
  //     name: title,
  //   },
  // ])

  return (
    <div>{slug}</div>
    // <div
    //   className="flex min-h-svh w-full flex-col bg-background text-foreground dark"
    //   id="screenshot"
    //   data-theme-scope="preview"
    // >
    //   <div className="flex flex-1 items-center justify-center">
    //     <section className="py-32 w-full">
    //       <div className="container mx-auto">
    //         <div className="mx-auto max-w-3xl text-center">
    //           <span
    //             data-slot="badge"
    //             data-variant="secondary"
    //             className="h-5 gap-1 rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium transition-all has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&>svg]:size-3! inline-flex items-center justify-center w-fit whitespace-nowrap shrink-0 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-error/20 dark:aria-invalid:ring-error/40 aria-invalid:border-error overflow-hidden group/badge bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80 mb-6"
    //           >
    //             Latest Updates
    //           </span>
    //           <h2 className="mb-3 text-3xl font-semibold text-pretty md:mb-4 md:text-5xl lg:mb-6">
    //             Blog Posts
    //           </h2>
    //           <p className="mb-12 text-muted-foreground md:text-base lg:text-lg">
    //             Discover the latest trends, tips, and best practices in modern
    //             web development. From UI components to design systems, stay
    //             updated with our expert insights.
    //           </p>
    //         </div>
    //         <div className="mx-auto max-w-5xl space-y-12">
    //           <div
    //             data-slot="card"
    //             data-size="default"
    //             className="ring-foreground/10 text-card-foreground gap-6 rounded-xl py-6 text-sm ring-1 has-[>img:first-child]:pt-0 data-[size=sm]:gap-4 data-[size=sm]:py-4 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl group/card flex flex-col overflow-hidden border-0 bg-transparent shadow-none"
    //           >
    //             <div className="flex flex-col gap-6 sm:flex-row">
    //               <div className="shrink-0">
    //                 <a
    //                   href="https://shadcnblocks.com"
    //                   target="_blank"
    //                   className="block transition-opacity duration-200 hover:opacity-90"
    //                   rel="noopener"
    //                 >
    //                   <img
    //                     alt="Getting Started with shadcn/ui Components"
    //                     className="aspect-16/9 w-full rounded-lg object-cover object-center sm:w-[260px]"
    //                     src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-dark-1.svg"
    //                   />
    //                 </a>
    //               </div>
    //               <div className="flex-1 space-y-3">
    //                 <div className="flex items-center gap-4 text-sm text-muted-foreground">
    //                   <span
    //                     data-slot="badge"
    //                     data-variant="secondary"
    //                     className="h-5 gap-1 rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium transition-all has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&>svg]:size-3! inline-flex items-center justify-center w-fit whitespace-nowrap shrink-0 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-error/20 dark:aria-invalid:ring-error/40 aria-invalid:border-error overflow-hidden group/badge bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80"
    //                   >
    //                     Tutorial
    //                   </span>
    //                   <span>Sarah Chen</span>
    //                   <span>1 Jan 2024</span>
    //                 </div>
    //                 <h3 className="text-xl leading-tight font-bold lg:text-2xl">
    //                   <a
    //                     href="https://shadcnblocks.com"
    //                     target="_blank"
    //                     className="hover:underline"
    //                     rel="noopener"
    //                   >
    //                     Getting Started with shadcn/ui Components
    //                   </a>
    //                 </h3>
    //                 <p className="text-base text-muted-foreground">
    //                   Learn how to quickly integrate and customize shadcn/ui
    //                   components in your Next.js projects. We'll cover
    //                   installation, theming, and best practices for building
    //                   modern interfaces.
    //                 </p>
    //                 <a
    //                   href="https://shadcnblocks.com"
    //                   target="_blank"
    //                   className="inline-flex items-center text-primary hover:underline"
    //                   rel="noopener"
    //                 >
    //                   Read more
    //                   <svg
    //                     xmlns="http://www.w3.org/2000/svg"
    //                     width={24}
    //                     height={24}
    //                     viewBox="0 0 24 24"
    //                     fill="none"
    //                     stroke="currentColor"
    //                     strokeWidth={2}
    //                     strokeLinecap="round"
    //                     strokeLinejoin="round"
    //                     className="lucide lucide-arrow-right ml-2 size-4"
    //                     aria-hidden="true"
    //                   >
    //                     <path d="M5 12h14" />
    //                     <path d="m12 5 7 7-7 7" />
    //                   </svg>
    //                 </a>
    //               </div>
    //             </div>
    //           </div>
    //           <div
    //             data-slot="card"
    //             data-size="default"
    //             className="ring-foreground/10 text-card-foreground gap-6 rounded-xl py-6 text-sm ring-1 has-[>img:first-child]:pt-0 data-[size=sm]:gap-4 data-[size=sm]:py-4 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl group/card flex flex-col overflow-hidden border-0 bg-transparent shadow-none"
    //           >
    //             <div className="flex flex-col gap-6 sm:flex-row">
    //               <div className="shrink-0">
    //                 <a
    //                   href="https://shadcnblocks.com"
    //                   target="_blank"
    //                   className="block transition-opacity duration-200 hover:opacity-90"
    //                   rel="noopener"
    //                 >
    //                   <img
    //                     alt="Building Accessible Web Applications"
    //                     className="aspect-16/9 w-full rounded-lg object-cover object-center sm:w-[260px]"
    //                     src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-dark-1.svg"
    //                   />
    //                 </a>
    //               </div>
    //               <div className="flex-1 space-y-3">
    //                 <div className="flex items-center gap-4 text-sm text-muted-foreground">
    //                   <span
    //                     data-slot="badge"
    //                     data-variant="secondary"
    //                     className="h-5 gap-1 rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium transition-all has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&>svg]:size-3! inline-flex items-center justify-center w-fit whitespace-nowrap shrink-0 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-error/20 dark:aria-invalid:ring-error/40 aria-invalid:border-error overflow-hidden group/badge bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80"
    //                   >
    //                     Accessibility
    //                   </span>
    //                   <span>Marcus Rodriguez</span>
    //                   <span>1 Jan 2024</span>
    //                 </div>
    //                 <h3 className="text-xl leading-tight font-bold lg:text-2xl">
    //                   <a
    //                     href="https://shadcnblocks.com"
    //                     target="_blank"
    //                     className="hover:underline"
    //                     rel="noopener"
    //                   >
    //                     Building Accessible Web Applications
    //                   </a>
    //                 </h3>
    //                 <p className="text-base text-muted-foreground">
    //                   Explore how to create inclusive web experiences using
    //                   shadcn/ui's accessible components. Discover practical tips
    //                   for implementing ARIA labels, keyboard navigation, and
    //                   semantic HTML.
    //                 </p>
    //                 <a
    //                   href="https://shadcnblocks.com"
    //                   target="_blank"
    //                   className="inline-flex items-center text-primary hover:underline"
    //                   rel="noopener"
    //                 >
    //                   Read more
    //                   <svg
    //                     xmlns="http://www.w3.org/2000/svg"
    //                     width={24}
    //                     height={24}
    //                     viewBox="0 0 24 24"
    //                     fill="none"
    //                     stroke="currentColor"
    //                     strokeWidth={2}
    //                     strokeLinecap="round"
    //                     strokeLinejoin="round"
    //                     className="lucide lucide-arrow-right ml-2 size-4"
    //                     aria-hidden="true"
    //                   >
    //                     <path d="M5 12h14" />
    //                     <path d="m12 5 7 7-7 7" />
    //                   </svg>
    //                 </a>
    //               </div>
    //             </div>
    //           </div>
    //           <div
    //             data-slot="card"
    //             data-size="default"
    //             className="ring-foreground/10 text-card-foreground gap-6 rounded-xl py-6 text-sm ring-1 has-[>img:first-child]:pt-0 data-[size=sm]:gap-4 data-[size=sm]:py-4 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl group/card flex flex-col overflow-hidden border-0 bg-transparent shadow-none"
    //           >
    //             <div className="flex flex-col gap-6 sm:flex-row">
    //               <div className="shrink-0">
    //                 <a
    //                   href="https://shadcnblocks.com"
    //                   target="_blank"
    //                   className="block transition-opacity duration-200 hover:opacity-90"
    //                   rel="noopener"
    //                 >
    //                   <img
    //                     alt="Modern Design Systems with Tailwind CSS"
    //                     className="aspect-16/9 w-full rounded-lg object-cover object-center sm:w-[260px]"
    //                     src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-dark-1.svg"
    //                   />
    //                 </a>
    //               </div>
    //               <div className="flex-1 space-y-3">
    //                 <div className="flex items-center gap-4 text-sm text-muted-foreground">
    //                   <span
    //                     data-slot="badge"
    //                     data-variant="secondary"
    //                     className="h-5 gap-1 rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium transition-all has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&>svg]:size-3! inline-flex items-center justify-center w-fit whitespace-nowrap shrink-0 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-error/20 dark:aria-invalid:ring-error/40 aria-invalid:border-error overflow-hidden group/badge bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80"
    //                   >
    //                     Design Systems
    //                   </span>
    //                   <span>Emma Thompson</span>
    //                   <span>1 Jan 2024</span>
    //                 </div>
    //                 <h3 className="text-xl leading-tight font-bold lg:text-2xl">
    //                   <a
    //                     href="https://shadcnblocks.com"
    //                     target="_blank"
    //                     className="hover:underline"
    //                     rel="noopener"
    //                   >
    //                     Modern Design Systems with Tailwind CSS
    //                   </a>
    //                 </h3>
    //                 <p className="text-base text-muted-foreground">
    //                   Dive into creating scalable design systems using Tailwind
    //                   CSS and shadcn/ui. Learn how to maintain consistency while
    //                   building flexible and maintainable component libraries.
    //                 </p>
    //                 <a
    //                   href="https://shadcnblocks.com"
    //                   target="_blank"
    //                   className="inline-flex items-center text-primary hover:underline"
    //                   rel="noopener"
    //                 >
    //                   Read more
    //                   <svg
    //                     xmlns="http://www.w3.org/2000/svg"
    //                     width={24}
    //                     height={24}
    //                     viewBox="0 0 24 24"
    //                     fill="none"
    //                     stroke="currentColor"
    //                     strokeWidth={2}
    //                     strokeLinecap="round"
    //                     strokeLinejoin="round"
    //                     className="lucide lucide-arrow-right ml-2 size-4"
    //                     aria-hidden="true"
    //                   >
    //                     <path d="M5 12h14" />
    //                     <path d="m12 5 7 7-7 7" />
    //                   </svg>
    //                 </a>
    //               </div>
    //             </div>
    //           </div>
    //         </div>
    //         <div className="mt-16 text-center">
    //           <a
    //             href="https://shadcnblocks.com"
    //             target="_blank"
    //             data-slot="button"
    //             data-variant="outline"
    //             data-size="lg"
    //             className="focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-error/20 dark:aria-invalid:ring-error/40 aria-invalid:border-error dark:aria-invalid:border-error/50 rounded-md border bg-clip-padding text-sm font-medium focus-visible:ring-3 aria-invalid:ring-3 [&_svg:not([class*='size-'])]:size-4 inline-flex items-center justify-center whitespace-nowrap transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none shrink-0 [&_svg]:shrink-0 outline-none group/button select-none border-border bg-background hover:bg-muted hover:text-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 aria-expanded:bg-muted aria-expanded:text-foreground shadow-xs h-10 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3 w-full sm:w-auto"
    //             rel="noopener"
    //           >
    //             View all articles
    //             <svg
    //               xmlns="http://www.w3.org/2000/svg"
    //               width={24}
    //               height={24}
    //               viewBox="0 0 24 24"
    //               fill="none"
    //               stroke="currentColor"
    //               strokeWidth={2}
    //               strokeLinecap="round"
    //               strokeLinejoin="round"
    //               className="lucide lucide-arrow-right ml-2 size-4"
    //               aria-hidden="true"
    //             >
    //               <path d="M5 12h14" />
    //               <path d="m12 5 7 7-7 7" />
    //             </svg>
    //           </a>
    //         </div>
    //       </div>
    //     </section>
    //   </div>
    // </div>
  )
}

export async function generateMetadata({ params: paramsPromise }: PageProps): Promise<Metadata> {
  const { slug } = await paramsPromise
  const tag = await queryTagBySlug({
    slug,
  })

  return generateMeta({
    doc: tag,
  })
}

const queryTagBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({
    config,
  })

  const { docs = [] } = await payload.find({
    collection: CollectionSlug['BlogTags'],
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

  return docs[0] ?? null
})
