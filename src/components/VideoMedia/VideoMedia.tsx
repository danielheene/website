'use client'

import {
  type SyntheticEvent,
  useCallback,
  useId,
  useMemo,
  useState,
  type VideoHTMLAttributes,
} from 'react'

import type { ClassValue } from 'tailwind-variants'
import { cn } from 'tailwind-variants'

export interface VideoMediaProps
  extends Omit<VideoHTMLAttributes<HTMLVideoElement>, 'className' | 'poster' | 'src' | 'onLoad'> {
  /** Absolute URL of the video file. */
  url: string
  /** Poster frame, produced by the GenerateVideoThumbnails task. */
  thumbnailURL?: string
  /** Low-quality placeholder of the poster frame, shown blurred while loading. */
  blurDataURL?: string
  width?: number
  height?: number
  className?: ClassValue
  loadedClassName?: ClassValue
  videoClassName?: ClassValue
  onLoadAction?: (event: SyntheticEvent<HTMLVideoElement>) => void
}

/**
 * Video counterpart to `ImageMedia`: renders the thumbnail as the poster and
 * fades a blurred placeholder out once the first frame is decodable, so the
 * layout never flashes an empty black box.
 */
export const VideoMedia = ({
  url,
  thumbnailURL,
  blurDataURL,
  width,
  height,
  className,
  loadedClassName,
  videoClassName,
  controls = true,
  preload = 'metadata',
  onLoadAction = () => undefined,
  ...otherProps
}: VideoMediaProps) => {
  const [loaded, setLoaded] = useState<boolean>(false)
  const [revealed, setRevealed] = useState<boolean>(false)
  const filterId = useId()

  const handleLoadedData = useCallback(
    (event: SyntheticEvent<HTMLVideoElement>) => {
      console.log(event)
      setLoaded(true)
      onLoadAction(event)
    },
    [
      onLoadAction,
    ],
  )

  const aspectRatio = useMemo(
    () => (width && height ? `${Math.round(width / height)}` : undefined),
    [
      width,
      height,
    ],
  )

  return (
    <div
      style={{
        aspectRatio,
      }}
      className={cn([
        'relative overflow-hidden',
        className,
        loaded && loadedClassName,
      ])}
    >
      <video
        className={cn([
          'block h-full w-full object-cover',
          videoClassName,
        ])}
        controls={controls}
        preload={preload}
        onCanPlay={handleLoadedData}
        poster={thumbnailURL}
        onLoadedData={handleLoadedData}
        onLoadedMetadata={handleLoadedData}
        {...otherProps}
      >
        <source src={url} />
      </video>

      {blurDataURL && !revealed && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={cn([
            'pointer-events-none absolute inset-0 h-full w-full animation-duration-[2s]',
            loaded && 'animate-fade-out',
          ])}
          tabIndex={-1}
          aria-hidden="true"
          onAnimationEnd={() => setRevealed(true)}
        >
          <title>Loading video</title>
          <filter id={filterId} colorInterpolationFilters="sRGB">
            <feGaussianBlur stdDeviation="20" />
            <feColorMatrix values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 100 -1" result="s" />
            <feFlood x="0" y="0" width="100%" height="100%" />
            <feComposite operator="out" in="s" />
            <feComposite in2="SourceGraphic" />
            <feGaussianBlur stdDeviation="20" />
          </filter>
          <image
            width="100%"
            height="100%"
            x="0"
            y="0"
            preserveAspectRatio="none"
            filter={`url(#${filterId})`}
            href={blurDataURL}
          />
        </svg>
      )}
    </div>
  )
}
