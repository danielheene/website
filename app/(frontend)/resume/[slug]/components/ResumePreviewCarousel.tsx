'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import Autoplay from 'embla-carousel-autoplay'
import Fade from 'embla-carousel-fade'
import useEmblaCarousel from 'embla-carousel-react'
import { cn } from 'tailwind-variants'

import { Button } from '@/components/Button'
import { Icon } from '@/components/Icon'
import { ImageMedia } from '@/components/ImageMedia'

/** How long the cross-fade takes. */
const FADE_MS = 1200

/** Dwell time before advancing to the next page. */
const DWELL_MS = 6000

export type ResumePreviewLocale = 'en' | 'de'

export type ResumePreviewPage = {
  id: string
  url: string
  blurDataURL?: string | null
}

const LOCALES: ResumePreviewLocale[] = ['en', 'de']

const LOCALE_LABELS: Record<ResumePreviewLocale, string> = {
  en: 'English',
  de: 'German',
}

export interface ResumePreviewCarouselProps {
  /** The page thumbnails of each language's PDF, in page order; a language without any is left out. */
  pages: Partial<Record<ResumePreviewLocale, ResumePreviewPage[]>>
  className?: string
}

const PageSlides = ({
  pages,
  onFirstPageLoaded,
}: {
  pages: ResumePreviewPage[]
  onFirstPageLoaded: () => void
}) => {
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

  // Arrow clicks go through the API, which Autoplay doesn't count as interaction: restart its timer
  const go = useCallback(
    (direction: 'prev' | 'next') => {
      if (!emblaApi) return

      if (direction === 'prev') emblaApi.scrollPrev()
      else emblaApi.scrollNext()

      emblaApi.plugins().autoplay?.reset()
    },
    [emblaApi],
  )

  const sheetRef = useRef<HTMLDivElement>(null)

  // A prioritized image can finish loading before hydration, when its `onLoad` has no listener yet
  useEffect(() => {
    const firstImage = sheetRef.current?.querySelector('img')

    if (firstImage?.complete && firstImage.naturalWidth > 0) onFirstPageLoaded()
  }, [onFirstPageLoaded])

  const hasSeveral = pages.length > 1

  return (
    <div className="flex items-center gap-2 sm:gap-4">
      <Button
        variant="outline"
        size="icon"
        aria-label="Previous page"
        disabled={!hasSeveral}
        onClick={() => go('prev')}
        className={cn(['shrink-0', !hasSeveral && 'invisible'])}
      >
        <Icon name="mdi:chevron-left" />
      </Button>

      <div
        ref={sheetRef}
        className={cn([
          'aspect-210/297 h-[45svh] w-auto max-w-full sm:h-[55svh] lg:h-[60svh]',
          'relative overflow-hidden bg-white shadow-2xl shadow-black/40',
        ])}
      >
        <div className="size-full" ref={emblaRef}>
          <div className="flex size-full">
            {pages.map((page, index) => (
              <div key={page.id} className="relative size-full min-w-0 shrink-0 grow-0 basis-full">
                <ImageMedia
                  url={page.url}
                  blurDataURL={page.blurDataURL}
                  alt={`Page ${index + 1}`}
                  fill
                  imgClassName="object-contain"
                  sizes="(min-width: 1024px) 30vw, 60vw"
                  priority={index === 0}
                  onLoadAction={index === 0 ? onFirstPageLoaded : undefined}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <Button
        variant="outline"
        size="icon"
        aria-label="Next page"
        disabled={!hasSeveral}
        onClick={() => go('next')}
        className={cn(['shrink-0', !hasSeveral && 'invisible'])}
      >
        <Icon name="mdi:chevron-right" />
      </Button>
    </div>
  )
}

/**
 * The pages of one language's resume PDF as a cross-fading carousel with arrows, and a switch
 * below for the other language. It fades in once the first page's image has loaded, so the
 * sheet never shows up empty.
 */
export const ResumePreviewCarousel = ({ pages, className }: ResumePreviewCarouselProps) => {
  const locales = LOCALES.filter((locale) => (pages[locale]?.length ?? 0) > 0)

  const [locale, setLocale] = useState<ResumePreviewLocale | undefined>(locales[0])
  const [ready, setReady] = useState(false)

  const handleFirstPageLoaded = useCallback(() => setReady(true), [])

  if (!locale) return null

  return (
    <div
      className={cn([
        'flex flex-col items-center gap-6 transition-opacity duration-700',
        ready ? 'opacity-100' : 'opacity-0',
        className,
      ])}
    >
      {/* remounted per language, so the carousel starts at that document's first page */}
      <PageSlides key={locale} pages={pages[locale]} onFirstPageLoaded={handleFirstPageLoaded} />

      {locales.length > 1 && (
        <fieldset aria-label="Preview language" className="flex gap-2 font-mono">
          {locales.map((option) => (
            <Button
              key={option}
              size="sm"
              variant={option === locale ? 'default' : 'outline'}
              aria-pressed={option === locale}
              onClick={() => setLocale(option)}
            >
              {LOCALE_LABELS[option]}
            </Button>
          ))}
        </fieldset>
      )}
    </div>
  )
}
