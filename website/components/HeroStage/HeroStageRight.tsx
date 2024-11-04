import React, { memo } from 'react';
import clsx from 'clsx';
import { HeroStageData } from '@lib/types';
import { Image } from '@components/Image';

type HeroStageRightProps = Pick<HeroStageData, 'portrait'>;

export const HeroStageRight = memo(({ portrait }: HeroStageRightProps) => {
  return (
    <React.Fragment>
      {portrait && (
        <div
          className={clsx([
            'w-full',
            'relative',
            'aspect-w-square',
            'aspect-h-square',
          ])}
        >
          <Image
            image={portrait}
            alt='Portrait Daniel Heene'
            priority
            className={clsx([
              'block',
              'w-10/12',
              'sm:w-full',
              'h-full',
              'pointer-events-none',
              'object-contain',
              'flex-shrink-1',
            ])}
          />
        </div>
      )}
    </React.Fragment>
  );
});
