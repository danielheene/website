'use client'

import { Media } from '@payload-types'
import { cn } from '@/utilities/cn'
import { ImageMedia } from '@/components/ImageMedia'
import RichText from '@/components/RichText'
import { SectionContainer } from './SectionContainer'
import { SectionProps } from '@custom-types'
import { useState } from 'react'

export const ResumeHeroSection = ({
  className,
  title,
  caption,
  background: backgroundMedia,
  portrait: portraitMedia,
}: SectionProps<'resumeHero'>) => {
  const background = backgroundMedia as Media
  const portrait = portraitMedia as Media

  const titleRows = title?.split('\n')
  const [isReady, setIsReady] = useState<boolean>(false)

  return (
    <SectionContainer
      className={cn([
        'w-full h-screen relative pt-32 -mt-32 text-white border-b-4 border-primary',
        className,
      ])}
    >
      {background && (
        <ImageMedia
          url={background.url}
          alt={background.alt}
          width={background.width}
          height={background.height}
          blurDataURL={background.blurDataURL}
          priority
          className="absolute top-0 right-0 left-0 bottom-0 z-0"
          fill
          duoTone
        />
      )}
      <div
        className={cn(
          'container h-full grid grid-cols-12 items-center relative opacity-0 transition-opacity duration-200',
          isReady && 'opacity-100',
        )}
      >
        <div className="col-span-10 col-start-2 md:col-span-5 md:col-start-2 text-center md:text-left">
          {title && (
            <h1>
              {titleRows.map((row, index) => (
                <span
                  key={index}
                  className={cn([
                    'font-pp-supply-mono text-4xl md:text-5xl xl:text-6xl bg-clip-text bg-white',
                  ])}
                >
                  {row}
                  <br />
                </span>
              ))}
            </h1>
          )}
          {caption && <RichText content={caption} enableGutter={false} />}
        </div>
        <div className="col-span-10 col-start-2 sm:col-span-6 sm:col-start-4 md:col-span-4 md:col-start-8 mb-auto md:mb-0">
          {portrait && (
            <ImageMedia
              url={portrait.url}
              alt={portrait.alt}
              width={portrait.width}
              height={portrait.height}
              blurDataURL={portrait.blurDataURL}
              priority
              className={cn(
                'w-full aspect-square rounded-full',
                'bg-gradient-to-tr from-primary-500 to-primary-700',
                'border-4 border-white',
              )}
              onLoadAction={() => setIsReady(true)}
              fill
            />
          )}
        </div>
      </div>
    </SectionContainer>
  )
}
