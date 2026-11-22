'use client'

import { type ReactNode, useEffect, useRef } from 'react'

import { cn } from 'tailwind-variants'

interface TopicIntroProps {
  title: string
  /** The topic's description; the box keeps its height without one. */
  children?: ReactNode
  className?: string
}

/**
 * Headline and description in a box of fixed height: room for two headline lines plus four
 * description lines, shared between them. The headline clamps at two lines, and the description
 * gets whatever height the headline leaves, clamped with an ellipsis to the lines that fit there.
 * Every topic takes the same height, so the topic list below doesn't jump when switching topics.
 */
export const TopicIntro = ({ title, children, className }: TopicIntroProps) => {
  const boxRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const descriptionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const box = boxRef.current
    const heading = titleRef.current
    const description = descriptionRef.current

    if (!box || !heading || !description) return

    // the clamp is a line count, so it is derived from the height the headline leaves
    const fit = () => {
      const gap = Number.parseFloat(getComputedStyle(box).rowGap) || 0
      const lineHeight = Number.parseFloat(getComputedStyle(description).lineHeight)
      const available = box.clientHeight - heading.offsetHeight - gap
      const lines = Math.max(1, Math.floor(available / lineHeight))

      description.style.setProperty('-webkit-line-clamp', String(lines))
    }

    fit()

    const observer = new ResizeObserver(fit)
    observer.observe(box)
    observer.observe(heading)

    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={boxRef}
      className={cn([
        'flex w-full flex-col gap-5 overflow-hidden lg:gap-8',
        // 2 headline lines + gap + 4 description lines, at each breakpoint's line heights
        'h-[calc(2*2.5rem+1.25rem+4*1.5rem)] lg:h-[calc(2*3.5rem+2rem+4*1.75rem)]',
        className,
      ])}
    >
      <h1
        ref={titleRef}
        className={cn([
          'line-clamp-2 shrink-0 font-mono text-4xl leading-10 font-extrabold',
          'lg:text-5xl lg:leading-14',
        ])}
      >
        {title}
      </h1>
      {children && (
        <div
          ref={descriptionRef}
          className={cn([
            // the server render clamps at four lines; the effect widens it once measured
            'line-clamp-4 text-base leading-6 text-muted-foreground lg:text-xl lg:leading-7',
            // paragraphs run on as one text so the clamp applies across all of them
            "[&_p]:inline [&_p:not(:last-child)]:after:content-['_']",
          ])}
        >
          {children}
        </div>
      )}
    </div>
  )
}
