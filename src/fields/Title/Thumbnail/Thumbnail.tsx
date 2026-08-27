/** biome-ignore-all lint/performance/noImgElement: <image is only visible in the admin dashboard> */

'use client'

import { type JSX, useEffect, useState } from 'react'

import { cn } from 'tailwind-variants'

interface ThumbnailProps {
  thumbnailURL: string
}

export const Thumbnail = ({ thumbnailURL }: ThumbnailProps): JSX.Element => {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (!isLoaded && thumbnailURL) {
      fetch(thumbnailURL).then(() => setIsLoaded(true))
    }
  }, [
    isLoaded,
    thumbnailURL,
  ])

  return (
    <div
      className={cn([
        'h-[40px]',
        'w-[40px]',
        'rounded-xs',
        'overflow-hidden',
      ])}
    >
      {isLoaded && (
        <img
          className={cn([
            'h-[40px]',
            'w-[40px]',
            'object-contain',
            'opacity-0',
            'animate-fade-in',
          ])}
          src={thumbnailURL}
          alt="Thumbnail"
        />
      )}
    </div>
  )
}
