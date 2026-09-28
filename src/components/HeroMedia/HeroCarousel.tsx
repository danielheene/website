'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import Autoplay from 'embla-carousel-autoplay'
import Fade from 'embla-carousel-fade'
import useEmblaCarousel from 'embla-carousel-react'
import { cn } from 'tailwind-variants'

import { type HeroMediaItem, HeroSlide } from './HeroSlide'

/** How long the cross-fade takes. Mirrors `--hero-fade-duration` in the CSS. */
const FADE_MS = 1200

/** Dwell time for a still image or shader before advancing. */
const IMAGE_DWELL_MS = 6000

export interface HeroCarouselProps {
  items: HeroMediaItem[]
  className?: string
}

/**
 * Cross-fading hero carousel.
 *
 * Images and shaders advance on a fixed dwell (`IMAGE_DWELL_MS`). Videos hold
 * the carousel for their full duration — autoplay is stopped while a video is
 * active and the hand-off fires on `ended` so the clip plays completely before
 * the next slide fades in.
 */
export const HeroCarousel = ({ items, className }: HeroCarouselProps) => {
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
        delay: IMAGE_DWELL_MS,
        stopOnInteraction: false,
        stopOnMouseEnter: false,
      }),
    ],
  )

  const [selected, setSelected] = useState(0)
  /** Guards against a video firing the hand-off more than once per play. */
  const handedOver = useRef<number | null>(null)

  useEffect(() => {
    if (!emblaApi) return

    const onSelect = () => {
      setSelected(emblaApi.selectedScrollSnap())
      handedOver.current = null
    }

    onSelect()
    emblaApi.on('select', onSelect)

    return () => {
      emblaApi.off('select', onSelect)
    }
  }, [
    emblaApi,
  ])

  /**
   * Pause the fixed-delay autoplay while a video slide is active; videos own
   * their timing and advance via `handleVideoHandoff`. Resume for images and
   * shaders so they dwell for the standard interval.
   */
  useEffect(() => {
    if (!emblaApi) return

    const autoplay = emblaApi.plugins().autoplay
    if (!autoplay) return

    if (items[selected]?.kind === 'video') {
      autoplay.stop()
    } else {
      autoplay.play()
    }
  }, [
    emblaApi,
    items,
    selected,
  ])

  /** Called by a video slide when it ends; advances to the next slide. */
  const handleVideoHandoff = useCallback(
    (index: number) => {
      if (!emblaApi) return
      // Nothing to hand over to: a lone slide loops instead (see HeroSlide),
      // and advancing would restart the video a fade-length early, forever.
      if (items.length < 2) return
      if (handedOver.current === index) return

      handedOver.current = index
      emblaApi.scrollNext()
    },
    [
      emblaApi,
      items.length,
    ],
  )

  return (
    <div className={cn('absolute inset-0 overflow-hidden', className)} ref={emblaRef}>
      <div className="flex h-full w-full">
        {items.map((item, index) => (
          <HeroSlide
            index={index}
            isActive={index === selected}
            item={item}
            key={item.id}
            // A single video has no successor to blend into, so it loops.
            loop={items.length < 2}
            onHandoff={handleVideoHandoff}
            // The first slide is the LCP candidate on most pages.
            priority={index === 0}
          />
        ))}
      </div>
    </div>
  )
}
