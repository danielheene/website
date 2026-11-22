import Link from 'next/link'

import { Button } from '@/components/Button'
import { HeroMedia } from '@/components/HeroMedia'
import { toSlideItems } from '@/components/HeroMedia/toSlideItems'
import { Icon } from '@/components/Icon'
import { TrackNotFound } from '@/components/UmamiLinkTracking'
import { fetchSiteSettingsCached } from '@/lib/fetchers'
import { CollectionSlug } from '@/types/collections'

// Shown when Site Settings has no error hero: one image slide in the shape `HeroMedia` reads.
const FALLBACK_HERO = [
  {
    slideType: 'image',
    media: {
      relationTo: CollectionSlug.MediaImages,
      value: {
        id: 'not-found-fallback',
        url: '/not-found-fallback.webp',
        alt: '',
      },
    },
  },
]

export default async function NotFound() {
  const {
    general: { errorHero },
  } = await fetchSiteSettingsCached()

  return (
    <HeroMedia
      align="center"
      fallbackAlt=""
      slides={toSlideItems(errorHero, '').length > 0 ? errorHero : FALLBACK_HERO}
    >
      <TrackNotFound />
      <div className="container flex flex-col items-center py-32 text-center">
        <div className="mb-20 font-pp-supply-mono drop-shadow-md">
          <h1 className="text-9xl">404</h1>
          <p className="text-3xl">This page could not be found.</p>
        </div>
        <Button variant="secondary" size="lg" className="px-8 py-4 font-mono text-4xl" asChild>
          <Link href="/">
            <span>GO TO HOMEPAGE</span>
            <Icon name="mdi:arrow-forward" className="ml-8 text-[110%] leading-[1em]" />
          </Link>
        </Button>
      </div>
    </HeroMedia>
  )
}
