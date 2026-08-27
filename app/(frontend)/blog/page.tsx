import type { Metadata } from 'next'

import { BlogListPage } from './_shared/BlogListPage'

/**
 * Unfiltered post listing. Later pages live at /blog/page/<n>.
 *
 * `searchParams` is deliberately not read here: doing so opts the route out of
 * prerendering under Cache Components, and the layout's cached reads then fail
 * the build. Legacy `?page=` links are redirected by proxy.ts instead.
 */
export default async function Page() {
  return <BlogListPage page={1} />
}

export const generateMetadata = async (): Promise<Metadata> => ({
  title: 'Blog',
})
