'use client'

import {
  type CSSProperties,
  type HTMLAttributes,
  type JSX,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'

export interface RevealOptions {
  rootMargin?: string
  transform?: CSSProperties['transform']
  duration?: CSSProperties['transitionDuration']
  stagger?: CSSProperties['transitionDelay']
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

export type RevealProps = HTMLAttributes<HTMLDivElement> & RevealOptions

/**
 * React component that reveals descendant elements marked with `data-reveal-item` when the wrapper enters the viewport.
 *
 * Applies configurable CSS custom properties for transform distance, transition duration, and stagger delay, then uses
 * `IntersectionObserver` to switch the wrapper from hidden to visible state. Motion is disabled for users who prefer
 * reduced motion, and server-rendered content already in the viewport is shown immediately to avoid hydration-time
 * reveal animations.
 */
export const Reveal = ({
  rootMargin = '0px 0px -25% 0px',
  transform = 'translateY(1rem)',
  duration = '600ms',
  stagger = '60ms',
  children,
  ...props
}: RevealProps): JSX.Element => {
  const ref = useRef<HTMLDivElement>(null)
  const isClientRender = useIsClientRender()
  // Only the first render tells whether this element came from the server;
  // useState keeps that initial value.
  const [wasServerRendered] = useState(!isClientRender)

  useLayoutEffect(() => {
    const element = ref.current

    if (!element) return

    element.style.setProperty('--reveal-transform', transform)
    element.style.setProperty('--reveal-stagger', stagger)
    element.style.setProperty('--reveal-duration', duration)

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
  }, [rootMargin, wasServerRendered, transform, duration, stagger])

  return (
    <>
      <div ref={ref} {...props}>
        {children}
      </div>
      <style jsx global>{`
        [data-reveal] [data-reveal-item] {
          opacity: 0;
          transform: var(--reveal-transform);
          transition: all var(--reveal-duration) cubic-bezier(0.16, 1, 0.3, 1);
          transition-delay: calc(min(var(--reveal-index), 8) * var(--reveal-stagger));
        }

        [data-reveal='visible'] [data-reveal-item] {
          opacity: 1;
          transform: none;
        }

        @media (prefers-reduced-motion: reduce) {
          [data-reveal] [data-reveal-item] {
            transition: none;
          }
        }
      `}</style>
    </>
  )
}
