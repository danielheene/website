'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import Autoplay from 'embla-carousel-autoplay'
import Fade from 'embla-carousel-fade'
import useEmblaCarousel from 'embla-carousel-react'
import { cn } from 'tailwind-variants'

import { type HeroMediaItem, HeroSlide } from './HeroSlide'

/** How long the cross-fade takes. Mirrors `--hero-fade-duration` in the CSS. */
const FADE_MS = 1200

/** Dwell time for a still image before advancing. */
const IMAGE_DWELL_MS = 6000

export interface HeroCarouselProps {
  items: HeroMediaItem[]
  className?: string
}

/**
 * Cross-fading hero carousel.
 *
 * Images advance on a fixed dwell; videos instead hold the carousel until they
 * are *almost* finished, then hand over. The hand-off starts `FADE_MS` before
 * the end so the outgoing video is still playing while the next slide fades up
 * — the video blends into its successor rather than freezing on a last frame
 * and then cutting.
 *
 * Autoplay is driven manually via `stopOnInteraction: false` + explicit reset,
 * because the delay is per-slide rather than uniform.
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
   * A video slide owns its own timing, so the fixed-delay autoplay is paused
   * while one is on screen and resumed when a still image comes back around.
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

  /**
   * Called by a video slide once it is within `FADE_MS` of its end. The
   * outgoing video keeps playing through the fade — Embla only swaps opacity —
   * so the two slides genuinely overlap.
   */
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
            fadeMs={FADE_MS}
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
