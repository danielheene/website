import { trackPageview } from '@/lib/umami/track'

/**
 * Fires an Umami pageview for the very first page load, before any
 * client-side navigation has happened. This is a genuine module-level side
 * effect that runs once per page load in the browser (and no-ops during
 * SSR/build, where `window` is undefined). Replaces the auto-tracking
 * Umami's vendor script used to do via `data-auto-track`, which tracked
 * every page view including the first.
 *
 * Note: `window.__UMAMI_SUPPRESSED__` is set by a Suspense-streamed script
 * rendered later in `<body>` (see `src/components/UmamiSuppressionFlag/`),
 * so at the moment this module first evaluates, that flag may not be set yet
 * even for a session that should be suppressed. This is the same accepted,
 * bounded race documented in `UmamiSuppressionFlag.tsx` — not something this
 * call needs to work around.
 */
if (typeof window !== 'undefined') {
  trackPageview()
}

/**
 * Fires an Umami pageview on each client-side transition, replacing the
 * auto-tracking Umami's vendor script used to do via `data-auto-track`.
 * `onRouterTransitionStart` fires BEFORE `location` updates to the
 * destination, so `href` is passed explicitly rather than letting
 * `trackPageview` derive the URL from `location` (which would still point at
 * the page being left).
 */
export const onRouterTransitionStart = (href: string): void => {
  trackPageview(href)
}
