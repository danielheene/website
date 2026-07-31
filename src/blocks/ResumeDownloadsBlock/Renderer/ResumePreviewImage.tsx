import { JSX } from 'react'

import { ClassValue, cn } from 'tailwind-variants'

import { ImageMedia } from '@/components/ImageMedia'
import { MediaImage } from '@/types/payload'

interface ResumePreviewImageProps
  extends Pick<MediaImage, 'width' | 'height' | 'url' | 'blurDataURL'> {
  className: ClassValue
}

export const ResumePreviewImage = ({
  width,
  height,
  className,
  url,
  blurDataURL,
}: ResumePreviewImageProps): JSX.Element => (
  <ImageMedia
    style={{
      aspectRatio: `${Math.round(width / height)}`,
    }}
    className={cn([
      'absolute top-0 right-0 z-40 flex w-3/5',
      'justify-center overflow-clip rounded-sm bg-background shadow-lg shadow-foreground/20',
      className,
    ])}
    sizes="25vw, 33vw, 50vw, 75vw"
    url={url}
    blurDataURL={blurDataURL}
    alt={''}
    width={width}
    height={height}
  />
)
