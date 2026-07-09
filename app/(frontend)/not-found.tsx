import Image from 'next/image'
import Link from 'next/link'
import config from '@payload-config'
import { getPayload } from 'payload'

import { Button } from '@/components/Button'
import { DuoTone } from '@/components/DuoTone'
import { Icon } from '@/components/Icon'
import { getSiteSettings } from '@/lib/getSiteSettings'
import { isMediaImage, isMediaVideo } from '@/lib/typeGuards'

export default async function NotFound() {
  const payload = await getPayload({
    config,
  })

  const {
    general: { errorHero },
  } = await getSiteSettings()

  return (
    <div className="relative min-h-full py-32 flex flex-col items-center justify-center">
      <DuoTone vignette>
        {errorHero && isMediaImage(errorHero.value) && (
          <Image
            src={errorHero.value.url}
            alt={errorHero.value.alt || ''}
            fill
            className="absolute h-screen w-screen -bottom-2 -right-2 -top-2 -left-2 object-cover"
          />
        )}
        {errorHero && isMediaVideo(errorHero.value) && (
          // biome-ignore lint/a11y/useMediaCaption: <explanation>
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
      <div className="container relative z-10 h-full text-center text-white flex flex-col justify-center items-center">
        <div className="text-white font-pp-supply-mono drop-shadow-md mb-20">
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
