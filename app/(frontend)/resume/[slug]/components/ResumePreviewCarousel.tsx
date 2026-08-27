'use client'

import { useEffect, useState } from 'react'

import Autoplay from 'embla-carousel-autoplay'
import Fade from 'embla-carousel-fade'
import useEmblaCarousel from 'embla-carousel-react'
import { cn } from 'tailwind-variants'

import { type HeroMediaItem, HeroSlide } from '@/components/HeroMedia/HeroSlide'

/** How long the cross-fade takes. */
const FADE_MS = 1200

/** Dwell time before advancing to the next slide. */
const DWELL_MS = 6000

export interface ResumePreviewCarouselProps {
  items: HeroMediaItem[]
  className?: string
}

/**
 * Cross-fading carousel for the EN/DE resume-preview thumbnails, with
 * click-to-jump dots.
 *
 * A scoped sibling of `HeroCarousel` rather than an extension of it —
 * `HeroCarousel` is shared full-bleed hero background infrastructure used
 * across the whole site (page heroes, 404, …), and this component's dots are
 * specific to having exactly one slide per locale here. Reuses `HeroSlide`
 * for the actual fade/image rendering so the two stay visually consistent.
 */
export const ResumePreviewCarousel = ({ items, className }: ResumePreviewCarouselProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      // Fade replaces translation, so dragging would fight the effect.
      watchDrag: false,
      duration: FADE_MS / 10, // Embla expresses duration in ~10ms ticks.
    },
    [
      Fade(),
      Autoplay({
        delay: DWELL_MS,
        stopOnInteraction: false,
        stopOnMouseEnter: false,
      }),
    ],
  )

  const [selected, setSelected] = useState(0)

  useEffect(() => {
    if (!emblaApi) return

    const onSelect = () => setSelected(emblaApi.selectedScrollSnap())

    onSelect()
    emblaApi.on('select', onSelect)

    return () => {
      emblaApi.off('select', onSelect)
    }
  }, [
    emblaApi,
  ])

  return (
    <div className={cn('relative h-full w-full overflow-hidden', className)}>
      <div className="h-full w-full" ref={emblaRef}>
        <div className="flex h-full w-full">
          {items.map((item, index) => (
            <HeroSlide
              fadeMs={FADE_MS}
              index={index}
              isActive={index === selected}
              item={item}
              key={item.id}
              loop={items.length < 2}
              onHandoff={() => undefined}
              priority={index === 0}
            />
          ))}
        </div>
      </div>

      {items.length > 1 && (
        <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              aria-label={`Show slide ${index + 1}`}
              aria-current={index === selected}
              onClick={() => emblaApi?.scrollTo(index)}
              className={cn([
                'h-2 w-2 rounded-full transition-colors',
                index === selected ? 'bg-primary' : 'bg-primary/30 hover:bg-primary/50',
              ])}
            />
          ))}
        </div>
      )}
    </div>
  )
}
