'use client'

import { memo, useState } from 'react'

import { Icon } from '@/components/Icon'
import { ImageMedia } from '@/components/ImageMedia'
import { cn } from '@/lib/cn'
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
        'col-span-12 md:col-span-4 lg:col-span-5 relative mt-16 md:mt-0',
        odd ? 'md:order-1' : 'md:order-2 md:col-start-9 lg:col-start-8',
      ])}
    >
      <div
        style={{
          aspectRatio: `${image.width} / ${image.height}`,
        }}
        className={cn([
          'relative bg-white border-4 border-primary rounded-sm',
          'transition-all duration-300 ease-in-out',
          'md:max-h-none md:h-full w-full md:w-auto overflow-hidden',
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
          className="absolute -top-1 -left-1 -right-1 -bottom-1 w-auto h-auto"
          // imgClassName="object-cover object-top md:object-contain md:object-center"
          onLoadAction={() => setIsReady(true)}
        />
      </div>
      <div className="clear-both" />
      <button
        type="button"
        className={cn([
          'md:hidden',
          'relative z-10 w-10 h-10 mx-auto -mt-5',
          'flex items-center justify-center text-3xl leading-none',
          'text-foreground bg-primary rounded-full hover:bg-primary-800',
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
