/** biome-ignore-all lint/performance/noImgElement: <explanation> */
'use client'

import type { ImageProps } from 'next/image'
import NextImage from 'next/image'
import { type SyntheticEvent, useCallback, useMemo, useState } from 'react'

import type { MediaImage } from '@/types/payload'
import { type ClassValue, cn } from '@/lib/cn'

export interface ImageMediaProps
  extends Omit<
      ImageProps,
      | 'className'
      | 'alt'
      | 'src'
      | 'blurDataURL'
      | 'placeholder'
      | 'width'
      | 'height'
      | 'onLoad'
    >,
    Pick<MediaImage, 'blurDataURL' | 'url'> {
  // duoTone?: boolean
  className: ClassValue
  // loadedClassName?: string
  // imgClassName?: string
  // imgLoadedClassName?: string
  alt?: string
  width?: number
  height?: number
  // onClick?: (event: SyntheticEvent<HTMLImageElement>) => void
  onLoadAction?: (event: SyntheticEvent<HTMLImageElement>) => void
  // priority?: boolean
  // size?: string
  // src?: StaticImport | string
  // resource?: MediaImage
}

export const ImageMedia = ({
  className,
  alt = '',
  url: src,
  sizes: sizesFromProps,
  fill,
  width,
  height,
  blurDataURL,
  onLoadAction = () => undefined,
  ...otherProps
}: ImageMediaProps) => {
  const [loaded, setLoaded] = useState<boolean>(false)
  const [revealed, setRevealed] = useState<boolean>(false)

  const handleOnLoad = useCallback(
    (_event: SyntheticEvent<HTMLImageElement>) => {
      setLoaded(true)
      onLoadAction(_event)
    },
    [
      onLoadAction,
    ],
  )

  const aspectRatio = useMemo(() => {
    if (fill) return 'auto'
    return `${Math.round(width)} / ${Math.round(height)}`
  }, [
    width,
    height,
    fill,
  ])

  // NOTE: this is used by the browser to determine which image to download at different screen sizes
  const sizes = sizesFromProps
    ? sizesFromProps
    : [
        '(max-width: 768px) 100vw',
        '(max-width: 1200px) 50vw',
        '33vw',
      ].join(', ')

  return (
    <div
      style={{
        aspectRatio,
      }}
      className={cn([
        'contents',
        !fill && 'relative',
        className,
      ])}
    >
      <NextImage
        alt={alt}
        className={cn([
          !fill && 'flex grow shrink basis-full',
          fill && 'block absolute inset-0 h-full w-full object-cover',
        ])}
        fill={fill}
        height={!fill && height}
        width={!fill && width}
        onLoad={handleOnLoad}
        placeholder="empty"
        // priority={priority}
        sizes={sizes}
        src={src}
        {...otherProps}
      />

      {!revealed && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={cn([
            'absolute inset-0 w-full h-full animation-duration-[2s]',
            loaded && 'animate-fade-out',
          ])}
          tabIndex={-1}
          aria-hidden="true"
          onAnimationEnd={() => setRevealed(true)}
        >
          <filter id="blur" colorInterpolationFilters="sRGB">
            <feGaussianBlur stdDeviation="20" />
            <feColorMatrix
              values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 100 -1"
              result="s"
            />
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
            filter="url(#blur)"
            href={blurDataURL}
          />
        </svg>
      )}
    </div>
  )
}
