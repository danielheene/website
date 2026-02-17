'use client'

import { cn } from '@/utilities/cn'
import { MediaImage } from '@payload-types'
import type { ImageProps } from 'next/image'
import NextImage from 'next/image'
import React, { CSSProperties, SyntheticEvent, useCallback, useState } from 'react'

export interface ImageMediaProps
  extends
    Omit<ImageProps, 'className' | 'alt' | 'src' | 'blurDataURL' | 'placeholder' | 'width' | 'height' | 'onLoad'>,
    Pick<MediaImage, 'blurDataURL' | 'url'> {
  duoTone?: boolean
  className?: string
  loadedClassName?: string
  imgClassName?: string
  imgLoadedClassName?: string
  alt: string
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
  duoTone,
  className,
  loadedClassName = '',
  imgClassName = '',
  imgLoadedClassName = '',
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

  const handleOnLoad = useCallback(
    (_event: SyntheticEvent<HTMLImageElement>) => {
      setLoaded(true)
      onLoadAction(_event)
    },
    [onLoadAction],
  )

  // NOTE: this is used by the browser to determine which image to download at different screen sizes
  const sizes = sizesFromProps ? sizesFromProps : ['(max-width: 768px) 100vw', '(max-width: 1200px) 50vw', '33vw'].join(', ')

  return (
    <div
      style={
        duoTone
          ? ({
              '--fg-color': 'var(--color-primary)',
              '--bg-color': 'var(--color-background)',
              '--bg-blend': 'lighten',
              '--fg-blend': 'darken',
            } as CSSProperties)
          : {}
      }
      className={cn([
        'flex flex-grow flex-shrink-0 basis-full',
        'h-full overflow-hidden p-0 relative',

        duoTone && [
          'bg-background',
          'before:absolute',
          'before:z-10',
          'before:left-0',
          'before:top-0',
          'before:right-0',
          'before:bottom-0',
          'before:w-full',
          'before:h-full',
          'before:bg-primary',
          'before:mix-blend-lighten',
          'dark:before:mix-blend-darken',
        ],

        className,
        loaded && loadedClassName,
      ])}
    >
      <NextImage
        alt={alt}
        className={cn([
          'flex-grow flex-shrink-0 basis-full relative',
          'h-full w-full max-w-full object-contain',
          'transition-opacity duration-500 ease-in-out',

          duoTone && 'grayscale contrast-100 blur-0 mix-blend-darken dark:mix-blend-lighten',
          fill && 'object-cover',

          // loaded ? 'opacity-100' : 'opacity-0',

          imgClassName,
          loaded && imgLoadedClassName,
        ])}
        fill={fill}
        height={!fill ? height : undefined}
        width={!fill ? width : undefined}
        // onClick={onClick}
        onLoad={handleOnLoad}
        blurDataURL={blurDataURL}
        placeholder={blurDataURL ? 'blur' : 'empty'}
        // priority={priority}
        sizes={sizes}
        src={src}
        {...otherProps}
      />
    </div>
  )
}
