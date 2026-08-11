import { DuoTone } from '@/components/DuoTone'
import { ImageMedia } from '@/components/ImageMedia'
import { cn } from '@/lib/cn'
import { CollectionSlug } from '@/types/collections'
import type { MediaImage, MediaVideo } from '@/types/payload'

import { HeroCarousel } from './HeroCarousel'
import type { HeroMediaItem } from './HeroSlide'

export interface HeroMediaProps {
  /** Polymorphic upload references straight from Payload. */
  media: unknown
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
 * A populated polymorphic upload entry.
 *
 * Note this is `relationTo`, not the `referenceTo` shape that
 * `@/lib/typeGuards` describes — that one belongs to the references plugin.
 * Payload's own upload fields emit `relationTo`, and `value` is only an object
 * once the relation has been populated.
 */
type UploadEntry<Slug extends string, Value> = {
  relationTo: Slug
  value: string | Value
}

const isPopulated = <Slug extends string, Value>(
  entry: unknown,
  slug: Slug,
): entry is UploadEntry<Slug, Value> & {
  value: Value
} =>
  typeof entry === 'object' &&
  entry !== null &&
  'relationTo' in entry &&
  entry.relationTo === slug &&
  'value' in entry &&
  typeof entry.value === 'object' &&
  entry.value !== null

/**
 * Normalizes Payload's polymorphic hero uploads into a flat list.
 *
 * Anything unpopulated (a bare id) or of an unexpected collection is dropped
 * rather than rendered as a broken slide.
 */
export const toItems = (media: unknown, fallbackAlt: string): HeroMediaItem[] => {
  const entries = Array.isArray(media)
    ? media
    : [
        media,
      ]

  return entries.flatMap((entry): HeroMediaItem[] => {
    if (isPopulated<'images', MediaImage>(entry, CollectionSlug.MediaImages)) {
      const { id, url, alt, blurDataURL } = entry.value
      if (!url) return []

      return [
        {
          kind: 'image',
          id: String(id),
          url,
          alt: alt || fallbackAlt,
          blurDataURL,
        },
      ]
    }

    if (isPopulated<'videos', MediaVideo>(entry, CollectionSlug.MediaVideos)) {
      const { id, url, thumbnails } = entry.value
      if (!url) return []

      // Videos have no alt of their own; the generated thumbnail doubles as a
      // poster so the slide is not blank before the first frame decodes.
      const poster = (thumbnails ?? []).find(
        (thumbnail) => typeof thumbnail?.value === 'object' && thumbnail.value?.url,
      )?.value

      return [
        {
          kind: 'video',
          id: String(id),
          url,
          alt: fallbackAlt,
          poster: typeof poster === 'object' ? poster.url : undefined,
        },
      ]
    }

    return []
  })
}

/**
 * Full-bleed hero visual: one asset, or a cross-fading carousel of several,
 * under the brand duotone treatment.
 *
 * `children` render above the visual — that is where the headline, topics and
 * meta go.
 */
export const HeroMedia = ({
  media,
  fallbackAlt = '',
  align = 'bottom',
  className,
  children,
}: HeroMediaProps) => {
  const items = toItems(media, fallbackAlt)

  return (
    <section
      className={cn(
        // Fills the first desktop screen without trapping short viewports.
        'relative flex min-h-[100svh] w-full flex-col overflow-hidden',
        align === 'center' ? 'justify-center' : 'justify-end',
        className,
      )}
    >
      {items.length > 0 && (
        <DuoTone contained className="absolute inset-0">
          {items.length === 1 && items[0].kind === 'image' ? (
            <ImageMedia
              alt={items[0].alt}
              blurDataURL={items[0].blurDataURL}
              className="object-cover"
              fill
              priority
              sizes="100vw"
              url={items[0].url}
            />
          ) : (
            <HeroCarousel items={items} />
          )}
        </DuoTone>
      )}

      {children && <div className="relative z-30 w-full">{children}</div>}
    </section>
  )
}
