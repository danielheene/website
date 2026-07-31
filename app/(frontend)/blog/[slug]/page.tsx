/** biome-ignore-all lint/a11y/useValidAnchor: <explanation> */
import { cache, Suspense } from 'react'
import { draftMode } from 'next/headers'
import config from '@payload-config'
import { getPayload } from 'payload'

import { PageContainer } from '@/components/PageContainer'
import { cn } from '@/lib/cn'
import { CollectionSlug } from '@/types/collections'

import { FeaturedTopics } from './components/FeaturedTopics'

export async function generateStaticParams() {
  const payload = await getPayload({
    config,
  })

  const { docs = [] } = await payload.find({
    collection: CollectionSlug.BlogTopics,
    pagination: false,
    limit: 0,
    draft: false,
    select: {
      slug: true,
    },
  })

  if (docs.length === 0) {
    // Cache Components requires at least one param for build-time validation;
    // '__placeholder__' resolves to notFound() against an empty database.
    return [
      {
        slug: '__placeholder__',
      },
    ]
  }

  return docs.map(({ slug }) => ({
    slug,
  }))
}

export default async function Page({ params }: PageProps<'/blog/[slug]'>) {
  const { slug } = await params

  // const topic = await queryTopicBySlug({
  //   slug,
  // })

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
    <PageContainer>
      <section
        className={cn([
          'py-32 w-full',
        ])}
      >
        <div
          className={cn([
            'container',
          ])}
        >
          <div
            className={cn([
              'relative mx-auto flex max-w-7xl flex-col gap-20 lg:flex-row',
            ])}
          >
            <header
              className={cn([
                'top-10 flex h-fit flex-col items-center gap-5 text-center lg:sticky lg:max-w-80 lg:items-start lg:gap-8 lg:text-left',
              ])}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={24}
                height={24}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1}
                strokeLinecap="round"
                strokeLinejoin="round"
                className={cn([
                  'lucide lucide-file-text h-full w-14',
                ])}
                aria-hidden="true"
              >
                <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
                <path d="M14 2v5a1 1 0 0 0 1 1h5" />
                <path d="M10 9H8" />
                <path d="M16 13H8" />
                <path d="M16 17H8" />
              </svg>
              <h1
                className={cn([
                  'text-4xl font-extrabold lg:text-5xl',
                ])}
              >
                Blog Posts: {slug}
              </h1>
              <p
                className={cn([
                  'text-muted-foreground lg:text-xl',
                ])}
              >
                Blog posts are a great way to share your knowledge and expertise with the world.
              </p>
              <div
                data-orientation="horizontal"
                role="none"
                data-slot="separator"
                className={cn([
                  'bg-border shrink-0 data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch',
                ])}
              />
              <nav>
                <Suspense>
                  <FeaturedTopics currentSlug={slug} />
                </Suspense>
              </nav>
            </header>
            <div
              className={cn([
                'grid gap-4 md:grid-cols-2',
              ])}
            >
              <a
                href="#"
                className={cn([
                  'group relative isolate h-80 rounded-lg bg-background',
                ])}
              >
                <div
                  className={cn([
                    'z-10 flex h-full flex-col justify-between p-6',
                  ])}
                >
                  <p
                    className={cn([
                      'text-muted-foreground transition-colors duration-500 group-hover:text-background',
                    ])}
                  >
                    May 20, 2024
                  </p>
                  <h2
                    className={cn([
                      'line-clamp-2 text-xl font-medium transition-colors duration-500 group-hover:text-background',
                    ])}
                  >
                    How to design a website from scratch
                  </h2>
                </div>
                <img
                  alt="How to design a website from scratch"
                  className={cn([
                    'absolute inset-0 -z-10 size-full rounded-lg object-cover brightness-50 transition-all duration-500 ease-[cubic-bezier(0.77,0,0.175,1)] [clip-path:inset(0_0_100%_0)] group-hover:[clip-path:inset(0_0_0%_0)]',
                  ])}
                  src="https://images.unsplash.com/photo-1536735561749-fc87494598cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2NDI3NzN8MHwxfGFsbHwxNzd8fHx8fHwyfHwxNzIzNjM0NDc0fA&ixlib=rb-4.0.3&q=80&w=1080"
                />
              </a>
              <a
                href="#"
                className={cn([
                  'group relative isolate h-80 rounded-lg bg-background',
                ])}
              >
                <div
                  className={cn([
                    'z-10 flex h-full flex-col justify-between p-6',
                  ])}
                >
                  <p
                    className={cn([
                      'text-muted-foreground transition-colors duration-500 group-hover:text-background',
                    ])}
                  >
                    June 12, 2024
                  </p>
                  <h2
                    className={cn([
                      'line-clamp-2 text-xl font-medium transition-colors duration-500 group-hover:text-background',
                    ])}
                  >
                    The best tools for web development and design
                  </h2>
                </div>
                <img
                  alt="The best tools for web development and design"
                  className={cn([
                    'absolute inset-0 -z-10 size-full rounded-lg object-cover brightness-50 transition-all duration-500 ease-[cubic-bezier(0.77,0,0.175,1)] [clip-path:inset(0_0_100%_0)] group-hover:[clip-path:inset(0_0_0%_0)]',
                  ])}
                  src="https://images.unsplash.com/photo-1653288973812-81d1951b8127?q=80&w=2022&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                />
              </a>
              <a
                href="#"
                className={cn([
                  'group relative isolate h-80 rounded-lg bg-background',
                ])}
              >
                <div
                  className={cn([
                    'z-10 flex h-full flex-col justify-between p-6',
                  ])}
                >
                  <p
                    className={cn([
                      'text-muted-foreground transition-colors duration-500 group-hover:text-background',
                    ])}
                  >
                    July 5, 2024
                  </p>
                  <h2
                    className={cn([
                      'line-clamp-2 text-xl font-medium transition-colors duration-500 group-hover:text-background',
                    ])}
                  >
                    How to market your website and get more traffic
                  </h2>
                </div>
                <img
                  alt="How to market your website and get more traffic"
                  className={cn([
                    'absolute inset-0 -z-10 size-full rounded-lg object-cover brightness-50 transition-all duration-500 ease-[cubic-bezier(0.77,0,0.175,1)] [clip-path:inset(0_0_100%_0)] group-hover:[clip-path:inset(0_0_0%_0)]',
                  ])}
                  src="https://images.unsplash.com/photo-1572733438515-8f143a854f72?q=80&w=1920&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                />
              </a>
              <a
                href="#"
                className={cn([
                  'group relative isolate h-80 rounded-lg bg-background',
                ])}
              >
                <div
                  className={cn([
                    'z-10 flex h-full flex-col justify-between p-6',
                  ])}
                >
                  <p
                    className={cn([
                      'text-muted-foreground transition-colors duration-500 group-hover:text-background',
                    ])}
                  >
                    August 18, 2024
                  </p>
                  <h2
                    className={cn([
                      'line-clamp-2 text-xl font-medium transition-colors duration-500 group-hover:text-background',
                    ])}
                  >
                    The future of web development and design
                  </h2>
                </div>
                <img
                  alt="The future of web development and design"
                  className={cn([
                    'absolute inset-0 -z-10 size-full rounded-lg object-cover brightness-50 transition-all duration-500 ease-[cubic-bezier(0.77,0,0.175,1)] [clip-path:inset(0_0_100%_0)] group-hover:[clip-path:inset(0_0_0%_0)]',
                  ])}
                  src="https://images.unsplash.com/photo-1546414701-81cc6963c67f?q=80&w=2144&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                />
              </a>
              <a
                href="#"
                className={cn([
                  'group relative isolate h-80 rounded-lg bg-background',
                ])}
              >
                <div
                  className={cn([
                    'z-10 flex h-full flex-col justify-between p-6',
                  ])}
                >
                  <p
                    className={cn([
                      'text-muted-foreground transition-colors duration-500 group-hover:text-background',
                    ])}
                  >
                    September 7, 2024
                  </p>
                  <h2
                    className={cn([
                      'line-clamp-2 text-xl font-medium transition-colors duration-500 group-hover:text-background',
                    ])}
                  >
                    The difference between UI and UX and how to design for both
                  </h2>
                </div>
                <img
                  alt="The difference between UI and UX and how to design for both"
                  className={cn([
                    'absolute inset-0 -z-10 size-full rounded-lg object-cover brightness-50 transition-all duration-500 ease-[cubic-bezier(0.77,0,0.175,1)] [clip-path:inset(0_0_100%_0)] group-hover:[clip-path:inset(0_0_0%_0)]',
                  ])}
                  src="https://images.unsplash.com/photo-1647715360138-33fb6fe68539?q=80&w=2022&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                />
              </a>
              <a
                href="#"
                className={cn([
                  'group relative isolate h-80 rounded-lg bg-background',
                ])}
              >
                <div
                  className={cn([
                    'z-10 flex h-full flex-col justify-between p-6',
                  ])}
                >
                  <p
                    className={cn([
                      'text-muted-foreground transition-colors duration-500 group-hover:text-background',
                    ])}
                  >
                    September 23, 2024
                  </p>
                  <h2
                    className={cn([
                      'line-clamp-2 text-xl font-medium transition-colors duration-500 group-hover:text-background',
                    ])}
                  >
                    Optimizing your website for SEO and getting more traffic from search engines
                  </h2>
                </div>
                <img
                  alt="Optimizing your website for SEO and getting more traffic from search engines"
                  className={cn([
                    'absolute inset-0 -z-10 size-full rounded-lg object-cover brightness-50 transition-all duration-500 ease-[cubic-bezier(0.77,0,0.175,1)] [clip-path:inset(0_0_100%_0)] group-hover:[clip-path:inset(0_0_0%_0)]',
                  ])}
                  src="https://images.unsplash.com/photo-1623496258831-091279081ac5?q=80&w=2021&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                />
              </a>
              <a
                href="#"
                className={cn([
                  'group relative isolate h-80 rounded-lg bg-background',
                ])}
              >
                <div
                  className={cn([
                    'z-10 flex h-full flex-col justify-between p-6',
                  ])}
                >
                  <p
                    className={cn([
                      'text-muted-foreground transition-colors duration-500 group-hover:text-background',
                    ])}
                  >
                    October 12, 2024
                  </p>
                  <h2
                    className={cn([
                      'line-clamp-2 text-xl font-medium transition-colors duration-500 group-hover:text-background',
                    ])}
                  >
                    The best tools for web development and design
                  </h2>
                </div>
                <img
                  alt="The best tools for web development and design"
                  className={cn([
                    'absolute inset-0 -z-10 size-full rounded-lg object-cover brightness-50 transition-all duration-500 ease-[cubic-bezier(0.77,0,0.175,1)] [clip-path:inset(0_0_100%_0)] group-hover:[clip-path:inset(0_0_0%_0)]',
                  ])}
                  src="https://images.unsplash.com/photo-1563952532949-3d1a874ad614?q=80&w=1951&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                />
              </a>
            </div>
          </div>
        </div>
      </section>
    </PageContainer>
  )
}
//
// export async function generateMetadata({ params }: PageProps<'/blog/[slug]'>): Promise<Metadata> {
//   // const { slug } = await params
//   //
//   // const topic = await queryTopicBySlug({
//   //   slug,
//   // })
//   //
//   // return generateMeta({
//   //   doc: topic,
//   // })
// }

const queryTopicBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({
    config,
  })

  const { docs = [] } = await payload.find({
    collection: CollectionSlug.BlogTopics,
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
