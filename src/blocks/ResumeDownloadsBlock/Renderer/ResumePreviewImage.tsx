import { JSX } from 'react'

import { isEmpty, isString } from 'lodash-es'
import { ClassValue, cn } from 'tailwind-variants'

import { ImageMedia } from '@/components/ImageMedia'
import { MediaImage } from '@/types/payload'

interface ResumePreviewImageProps extends Pick<MediaImage, 'url' | 'blurDataURL'> {
  className?: ClassValue
}

/** One page thumbnail as a DIN A4 sheet (210 × 297); the image covers the sheet. */
export const ResumePreviewImage = ({
  className,
  url,
  blurDataURL,
}: ResumePreviewImageProps): JSX.Element => {
  if (!isString(url) || isEmpty(url)) return null

  return (
    <div
      className={cn([
        'absolute aspect-210/297 overflow-clip rounded-sm bg-white shadow-xl shadow-black/30',
        className,
      ])}
    >
      <ImageMedia
        fill
        sizes="(min-width: 768px) 25vw, 50vw"
        url={url}
        blurDataURL={blurDataURL}
        alt=""
      />
    </div>
  )
}
