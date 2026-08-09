import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

import { BlogListPage, countTotalPages, resolvePageParam } from '../../_shared/BlogListPage'

/**
 * Cache Components requires at least one param to validate against; without
 * this the route cannot prerender and the build fails on a blocking read in
 * the shared layout. Page 2 always exists once there is more than one page,
 * and further pages are generated on demand.
 */
export async function generateStaticParams() {
  return [
    {
      page: '2',
    },
  ]
}

/** Paginated unfiltered listing: /blog/page/2 and beyond. */
export default async function Page({ params }: PageProps<'/blog/page/[page]'>) {
  const { page: rawPage } = await params
  const page = resolvePageParam(rawPage)

  if (page === null) notFound()
  // page 1 has a canonical URL of its own; never serve it twice
  if (page === 1) redirect('/blog')

  if (page > (await countTotalPages())) notFound()

  return <BlogListPage page={page} />
}

export async function generateMetadata({
  params,
}: PageProps<'/blog/page/[page]'>): Promise<Metadata> {
  const { page } = await params

  return {
    title: `Blog — page ${page}`,
  }
}
