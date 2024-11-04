import React, { memo, useMemo } from 'react';
import NextImage, { ImageProps as NextImageProps } from 'next/image';
import clsx from 'clsx';
import { ImageAssetFragment } from '@lib/types';

interface ImageProps extends Omit<NextImageProps, 'src' | 'alt' | 'altText'> {
  image: ImageAssetFragment;
  className?: string;
  removeBlur?: boolean;
  blur?: number;
  dpr?: number;
  quality?: number;
  invert?: boolean;
  saturation?: number;
  sharpen?: number;
  alt?: string;
}

export const Image = memo(
  ({
    image,
    blur,
    dpr,
    quality,
    sharpen,
    saturation,
    priority,
    fill = true,
    invert,
    className = '',
    sizes = '100vw',
    loading = 'lazy',
    ...props
  }: ImageProps): JSX.Element => {
    const url = useMemo(() => {
      if (!image?.url) return null;
      const url = new URL(image.url);

      if (saturation) url.searchParams.set('sat', saturation.toString());
      if (quality) url.searchParams.set('q', quality.toString());
      if (sharpen) url.searchParams.set('sharpen', sharpen.toString());
      if (invert) url.searchParams.set('invert', 'true');
      if (dpr) url.searchParams.set('dpr', dpr.toString());
      if (blur) url.searchParams.set('blur', blur.toString());

      return url.toString();
    }, [image, sharpen, saturation, quality, dpr, blur]);

    return url ? (
      <NextImage
        src={url}
        sizes={sizes}
        loading={!priority ? loading : undefined}
        blurDataURL={image.lqip}
        placeholder={!!image.lqip ? 'blur' : undefined}
        className={clsx(
          !className.includes('object-') && 'object-cover',
          className
        )}
        fill={fill}
        width={!fill ? image.dimensions.width : undefined}
        height={!fill ? image.dimensions.height : undefined}
        {...props}
        alt={props?.alt ?? image?.originalFilename ?? ''}
      />
    ) : null;
  }
);
