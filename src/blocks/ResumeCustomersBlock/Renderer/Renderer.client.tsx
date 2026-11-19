'use client'

import { DiagonalMarquee } from '@/components/DiagonalMarquee'
import { Headline } from '@/components/Headline'
import { LogoCarouselProps, LogoCarouselTile } from '@/components/LogoCarousel/LogoCarousel'
import { Reveal } from '@/components/Reveal'
import RichText from '@/components/RichText'
import { SectionContainer } from '@/components/SectionContainer'
import type { BlockAnchors } from '@/lib/extractHeadings'
import { ResumeCustomersBlock } from '@/types/payload'

interface ResumeCustomersBlockClientRendererProps extends ResumeCustomersBlock, BlockAnchors {
  title: string
  logos: LogoCarouselProps['entries']
  /** The marquee rows, each holding every logo in its own order. */
  rows: LogoCarouselProps['entries'][]
}

export const ResumeCustomersBlockClientRenderer = ({
  anchorId,
  blockType: _blockType,
  title,
  caption,
  logos,
  rows,
}: ResumeCustomersBlockClientRendererProps) => {
  return (
    <SectionContainer id={anchorId} title={title} variant="primary">
      <div className="relative isolate overflow-hidden py-24 lg:py-40">
        <DiagonalMarquee
          rows={rows}
          renderItem={(logo) => (
            <div className="aspect-4/3 h-full">
              <LogoCarouselTile
                {...logo}
                className="flex items-center justify-center *:max-h-3/5 *:max-w-3/5"
              />
            </div>
          )}
        />

        {/* Fade the band into the section at its top and bottom edges. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-1/4 bg-ease-to-b from-primary to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-1/4 bg-ease-to-t from-primary to-transparent"
        />

        <div className="relative z-20 container flex justify-center">
          <Reveal className="flex w-full max-w-4xl flex-col items-center justify-center gap-8 bg-primary p-8 text-center shadow-2xl sm:aspect-video lg:gap-12 lg:p-16">
            {title && (
              <Headline variant="section" data-reveal-item>
                {title}
              </Headline>
            )}
            {caption && (
              <div data-reveal-item>
                <RichText className="text-inherit" data={caption} enableGutter={false} />
              </div>
            )}
          </Reveal>
        </div>

        {/* The marquee is decorative and hidden from assistive technology. */}
        <ul className="sr-only">
          {logos.map(({ id, title: customer }) => (
            <li key={id}>{customer}</li>
          ))}
        </ul>
      </div>
    </SectionContainer>
  )
}
