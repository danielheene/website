import { cn } from 'tailwind-variants'

import { DuoTone } from '@/components/DuoTone'
import { ImageMedia } from '@/components/ImageMedia'

import { HeroCarousel } from './HeroCarousel'
import { ShaderHeroBackground } from './ShaderHeroBackground'
import { toSlideItems } from './toSlideItems'

export interface HeroMediaProps {
  /** The whole `hero.slides` array value: `{ slideType, media, shader }[]`. */
  slides: unknown
  /** Falls back to this when an asset carries no alt text of its own. */
  fallbackAlt?: string
  /**
   * Where the overlaid `children` sit. Page and post heroes hang their titles
   * off the bottom edge; a standalone screen like 404 centres instead.
   */
  align?: 'bottom' | 'center'
  className?: string
  children?: React.ReactNode
}

/**
 * Full-bleed hero visual: one slide rendered directly, or a cross-fading
 * carousel of several — each slide an image, a video, or a live shader
 * background — under the brand duotone treatment.
 *
 * `children` render above the visual — that is where the headline, topics and
 * meta go.
 */
export const HeroMedia = ({
  slides,
  fallbackAlt = '',
  align = 'bottom',
  className,
  children,
}: HeroMediaProps) => {
  const items = toSlideItems(slides, fallbackAlt)
  const hasVisual = items.length > 0

  return (
    <section
      className={cn(
        // Fills the first desktop screen without trapping short viewports.
        'relative flex min-h-[100svh] w-full flex-col overflow-hidden',
        align === 'center' ? 'justify-center' : 'justify-end',
        className,
      )}
    >
      {hasVisual && (
        <DuoTone contained className="absolute inset-0">
          {items.length > 1 ? (
            <HeroCarousel items={items} />
          ) : items[0].kind === 'image' ? (
            <ImageMedia
              alt={items[0].alt}
              blurDataURL={items[0].blurDataURL}
              className="object-cover"
              fill
              priority
              sizes="100vw"
              url={items[0].url}
            />
          ) : items[0].kind === 'video' ? (
            // A single video has no successor to blend into, so it loops —
            // mirrors HeroCarousel's `loop={items.length < 2}` for one slide.
            <video
              autoPlay
              className="h-full w-full object-cover"
              loop
              muted
              playsInline
              poster={items[0].poster ?? undefined}
              preload="auto"
              src={items[0].url}
            />
          ) : (
            <ShaderHeroBackground
              className="absolute inset-0 h-full w-full"
              presetKey={items[0].presetKey}
            />
          )}
        </DuoTone>
      )}

      {children && <div className="relative z-30 w-full">{children}</div>}
    </section>
  )
}
