import type { Metadata } from 'next'

import { BlogListPage } from './_shared/BlogListPage'

/**
 * Unfiltered post listing. Pagination and sorting live in `?page=` and
 * `?sort=`; the promise is handed to the listing unresolved so it is only read
 * inside a Suspense boundary and the page shell stays prerendered.
 */
export default function Page({ searchParams }: PageProps<'/blog'>) {
  return <BlogListPage searchParams={searchParams} />
}

export const generateMetadata = async (): Promise<Metadata> => ({
  title: 'Blog',
})
