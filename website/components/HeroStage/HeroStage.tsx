import React, { memo } from 'react';
import clsx, { ClassValue } from 'clsx';

import { HeroStageData } from '@lib/types';
import { HeroStageLeft } from './HeroStageLeft';
import { HeroStageRight } from './HeroStageRight';

interface HeroStageProps extends HeroStageData {
  className?: ClassValue | string;
}

export const HeroStage = memo(
  ({
    className,
    portrait,
    subHeadline,
    headline,
  }: HeroStageProps): JSX.Element => {
    return (
      <section
        className={clsx([
          'relative',
          'container',
          'flex',
          'flex-col',
          'lg:flex-row',
          'justify-center',
          'items-start',
          'lg:items-center',
          'py-36',
          '-mt-36',
          'lg:min-h-screen',
          'gap-16',
          className,
        ])}
      >
        <div
          className={clsx([
            'order-1',
            'lg:order-2',
            'w-full',
            'sm:p-24',
            'lg:p-0',
          ])}
        >
          <HeroStageRight portrait={portrait} />
        </div>
        <div
          className={clsx([
            'flex',
            'flex-col',
            'items-center',
            'justify-center',
            'order-2',
            'lg:order-1',
            'w-full',
          ])}
        >
          <HeroStageLeft headline={headline} subHeadline={subHeadline} />
        </div>
      </section>
    );
  }
);
