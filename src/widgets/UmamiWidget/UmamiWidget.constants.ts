/** Max rows `PathsSection`/`EventsSection` paginate to — see `useArrayPagination`. */
export const LIST_PAGE_SIZE = 10

/**
 * Shared card-content height class across the Pageviews/Paths/Events row.
 *
 * Paths and Events size their content to `LIST_PAGE_SIZE` rows at 40px
 * each (incl. `gap-y-3`); Pageviews has no natural height of its own, so it
 * matches theirs instead of carrying an unrelated fixed value. A literal
 * Tailwind class, not an interpolated one, since arbitrary-value classes
 * must appear as-written for the JIT scanner to generate them.
 */
export const SECTION_CONTENT_HEIGHT_CLASS = 'h-[400px]'
