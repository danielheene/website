import { notFound } from 'next/navigation'

/**
 * The target `proxy.ts` rewrites unknown slugs to. With Cache Components a
 * dynamic route sends its prerendered shell, and so a `200`, before the page
 * can call `notFound()`; this route calls it while prerendering, so it is
 * served as a real `404` with the site's not-found page.
 */
export default function NotFoundPage() {
  notFound()
}
