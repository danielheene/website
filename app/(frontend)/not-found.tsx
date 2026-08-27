import Link from 'next/link'

import { Button } from '@/components/Button'
import { HeroMedia } from '@/components/HeroMedia'
import { Icon } from '@/components/Icon'
import { fetchSiteSettingsCached } from '@/lib/fetchers'

export default async function NotFound() {
  const {
    general: { errorHero },
  } = await fetchSiteSettingsCached()

  return (
    <HeroMedia
      align="center"
      fallbackAlt=""
      background={{
        backgroundType: 'media',
        media: errorHero,
      }}
    >
      <div className="container flex flex-col items-center py-32 text-center text-foreground">
        <div className="mb-20 font-pp-supply-mono drop-shadow-md">
          <h1 className="text-9xl">404</h1>
          <p className="text-3xl">This page could not be found.</p>
        </div>
        <Button color="secondary" size="lg" className="text-4xl px-8 py-4 font-mono" asChild>
          <Link href="/">
            <span>GO TO HOMEPAGE</span>
            <Icon name="mdi:arrow-forward" className="ml-8 text-[110%] leading-[1em]" />
          </Link>
        </Button>
      </div>
    </HeroMedia>
  )
}
