'use client'

import { useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'

export interface UseRevealOptions {
  /**
   * IntersectionObserver `rootMargin`. The default reveals an element once it
   * is a quarter of the way into the viewport.
   */
  rootMargin?: string
}

const noopSubscribe = () => () => {}

/**
 * `false` while React hydrates server HTML, `true` for anything rendered on
 * the client (e.g. the new page of a client-side navigation).
 */
const useIsClientRender = () =>
  useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  )

const isInViewport = (element: HTMLElement) => {
  const { top, bottom } = element.getBoundingClientRect()
  return top < window.innerHeight && bottom > 0
}

/**
 * Reveal-on-scroll. Sets `data-reveal="hidden"` on the returned ref's element
 * and flips it to `"visible"` once it scrolls into view; the animation itself
 * is CSS (see "Reveal on scroll" in `frontend.css`). Children marked with
 * `data-reveal-item` get a `--reveal-index` so they can stagger.
 *
 * Content stays visible without JS (the attribute is never set), under
 * `prefers-reduced-motion`, and when it was server-rendered inside the
 * viewport: the visitor has already seen it, so hiding it on hydration would
 * make it blink and push back LCP.
 */
export const useReveal = <T extends HTMLElement = HTMLElement>({
  rootMargin = '0px 0px -25% 0px',
}: UseRevealOptions = {}) => {
  const ref = useRef<T>(null)
  const isClientRender = useIsClientRender()
  // Only the first render tells whether this element came from the server;
  // useState keeps that initial value.
  const [wasServerRendered] = useState(!isClientRender)

  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return

    element.querySelectorAll<HTMLElement>('[data-reveal-item]').forEach((item, index) => {
      item.style.setProperty('--reveal-index', String(index))
    })

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion || (wasServerRendered && isInViewport(element))) {
      element.dataset.reveal = 'visible'
      return
    }

    element.dataset.reveal = 'hidden'
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        element.dataset.reveal = 'visible'
        observer.disconnect()
      },
      {
        rootMargin,
      },
    )
    observer.observe(element)

    return () => observer.disconnect()
  }, [rootMargin, wasServerRendered])

  return ref
}
