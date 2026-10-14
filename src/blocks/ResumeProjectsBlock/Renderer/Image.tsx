'use client'

import { memo, useState } from 'react'

import { cn } from 'tailwind-variants'

import { Icon } from '@/components/Icon'
import { ImageMedia } from '@/components/ImageMedia'
import type { MediaImage } from '@/types/payload'

interface ResumeProjectsSectionImageProps {
  image: MediaImage
  odd: boolean
}

export const Image = memo(function ResumeProjectsSectionImage({
  image,
  odd,
}: ResumeProjectsSectionImageProps) {
  const [isReady, setIsReady] = useState<boolean>(false)
  const [showImage, setShowImage] = useState<boolean>(false)

  return (
    <div
      className={cn([
        'relative col-span-12 mt-16 md:col-span-4 md:mt-0 lg:col-span-5',
        odd ? 'md:order-1' : 'md:order-2 md:col-start-9 lg:col-start-8',
      ])}
    >
      <div
        style={
          image.width && image.height
            ? {
                aspectRatio: `${Math.round(image.width / image.height)}`,
              }
            : undefined
        }
        className={cn([
          'relative rounded-sm border-4 border-primary bg-card',
          'transition-all duration-300 ease-in-out',
          'w-full overflow-hidden md:h-full md:max-h-none md:w-auto',
          showImage ? 'max-h-[1000px]' : 'max-h-40',
          isReady ? 'opacity-100' : 'opacity-0',
          odd ? 'md:float-right' : 'md:float-left',
        ])}
      >
        <ImageMedia
          url={image.url}
          alt={image.alt}
          height={image.height}
          width={image.width}
          loading="lazy"
          className="absolute -top-1 -right-1 -bottom-1 -left-1 size-auto"
          // imgClassName="object-cover object-top md:object-contain md:object-center"
          onLoadAction={() => setIsReady(true)}
        />
      </div>
      <div className="clear-both" />
      <button
        type="button"
        className={cn([
          'md:hidden',
          'relative z-10 mx-auto -mt-5 size-10',
          'flex items-center justify-center text-3xl leading-none',
          'rounded-full bg-primary text-primary-foreground hover:bg-primary-800',
          'transition-all duration-300 ease-in-out',
          showImage ? 'rotate-180' : 'rotate-0',
        ])}
        onClick={() => setShowImage(!showImage)}
      >
        <Icon name="mdi:arrow-downward" />
      </button>
    </div>
  )
})
