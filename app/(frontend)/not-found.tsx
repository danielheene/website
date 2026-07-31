import Image from 'next/image'
import Link from 'next/link'

import { Button } from '@/components/Button'
import { DuoTone } from '@/components/DuoTone'
import { Icon } from '@/components/Icon'
import { fetchSiteSettingsCached } from '@/lib/fetchers'
import { isMediaImageReference, isMediaVideoReference } from '@/lib/typeGuards'

export default async function NotFound() {
  const {
    general: { errorHero },
  } = await fetchSiteSettingsCached()

  return (
    <div className="relative min-h-full py-32 flex flex-col items-center justify-center">
      <DuoTone vignette>
        {errorHero && isMediaImageReference(errorHero) && (
          <Image
            src={errorHero.value.url}
            alt={errorHero.value.alt || ''}
            fill
            className="absolute h-screen w-screen -bottom-2 -right-2 -top-2 -left-2 object-cover"
          />
        )}
        {errorHero && isMediaVideoReference(errorHero) && (
          <video
            src={errorHero.value.url}
            loop
            autoPlay
            playsInline
            controls={false}
            muted
            className="absolute h-screen w-screen -bottom-2 -right-2 -top-2 -left-2 object-cover"
          />
        )}
        {/*<ImageMedia*/}
        {/*  alt=""*/}
        {/*  fill*/}
        {/*  priority*/}
        {/*  url="/not-found.webp"*/}
        {/*  className="absolute h-screen w-screen -bottom-2 -right-2 -top-2 -left-2 object-cover"*/}
        {/*/>*/}
      </DuoTone>
      <div className="container relative z-10 h-full text-center text-foreground flex flex-col justify-center items-center">
        <div className="text-foreground font-pp-supply-mono drop-shadow-md mb-20">
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
    </div>
  )
}
