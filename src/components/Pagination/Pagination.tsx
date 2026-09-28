import { JSX } from 'react'
import Link from 'next/link'

import { cn } from 'tailwind-variants'

import { Button } from '@/components/Button'
import { Icon } from '@/components/Icon'

interface PaginationProps {
  page: number
  totalPages: number
  /**
   * Builds the href for a page number, so the caller owns the URL scheme
   * (e.g. `?page=<n>` alongside whatever other params the listing carries).
   */
  pageHref: (page: number) => string
}

export const Pagination = ({ page, totalPages, pageHref }: PaginationProps): JSX.Element => {
  if (totalPages <= 1) return null

  return (
    <nav
      aria-label="Pagination"
      className={cn([
        'col-span-full mt-8 flex items-center justify-center gap-2 font-mono',
      ])}
    >
      {page > 1 && (
        <Button size="icon-sm" variant="outline" asChild>
          <Link href={pageHref(page - 1)} rel="prev">
            <Icon name="material-symbols:arrow-back-ios-new" />
          </Link>
        </Button>
      )}
      {Array.from(
        {
          length: totalPages,
        },
        (_, index) => index + 1,
      ).map((target) => (
        <Button key={target} size="sm" variant={target === page ? 'default' : 'outline'} asChild>
          <Link href={pageHref(target)} aria-current={target === page ? 'page' : undefined}>
            {target}
          </Link>
        </Button>
      ))}
      {page < totalPages && (
        <Button size="icon-sm" variant="outline" asChild>
          <Link href={pageHref(page + 1)} rel="next">
            <Icon name="material-symbols:arrow-forward-ios" />
          </Link>
        </Button>
      )}
    </nav>
  )
}
