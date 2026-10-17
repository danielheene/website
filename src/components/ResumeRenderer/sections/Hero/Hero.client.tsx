'use client'

import { useState } from 'react'

import { cn } from 'tailwind-variants'

import { ImageMedia } from '@/components/ImageMedia'
import type { MediaImage } from '@/types/payload'

export const HeroClient = ({
  title,
  background,
  portrait,
}: {
  title?: string
  background?: MediaImage
  portrait?: MediaImage
}) => {
  const titleRows = title?.split('\n')
  const [isReady, setIsReady] = useState<boolean>(false)

  return (
    <section className="relative h-screen w-full shrink-0 grow-0">
      {background && (
        <ImageMedia
          url={background.url}
          alt={background.alt}
          width={background.width}
          height={background.height}
          blurDataURL={background.blurDataURL}
          className="absolute inset-0 z-0"
          fill
        />
      )}
      <div
        className={cn(
          'relative container grid h-full grid-cols-12 items-center opacity-0 transition-opacity duration-200',
          isReady && 'opacity-100',
        )}
      >
        <div className="col-span-10 col-start-2 text-center md:col-span-5 md:col-start-2 md:text-left">
          {title && (
            <h1>
              {titleRows.map((row, index) => (
                <span
                  key={index}
                  className={cn([
                    'bg-white bg-clip-text font-pp-supply-mono text-4xl md:text-5xl xl:text-6xl',
                  ])}
                >
                  {row}
                  <br />
                </span>
              ))}
            </h1>
          )}
        </div>
        <div className="col-span-10 col-start-2 mb-auto sm:col-span-6 sm:col-start-4 md:col-span-4 md:col-start-8 md:mb-0">
          {portrait && (
            <ImageMedia
              url={portrait.url}
              alt={portrait.alt}
              width={portrait.width}
              height={portrait.height}
              blurDataURL={portrait.blurDataURL}
              priority
              sizes="(max-width: 48rem) 100vw, (max-width: 64rem) 33vw, (max-width: 80rem) 25vw, 400px"
              className={cn(
                'aspect-square w-full rounded-full',
                'bg-linear-to-tr from-primary-500 to-primary-700',
                'border-4 border-white',
              )}
              onLoadAction={() => setIsReady(true)}
              fill
            />
          )}
        </div>
      </div>
    </section>
  )
}
