import React, { memo, useCallback, useEffect, useState } from 'react';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { ContactModule } from '@components/ContactServices';
import { ContactProvider, HeroStageData } from '@lib/types';
import { useAppStore } from '@lib/appStore';

type HeroStageLeftProps = Pick<HeroStageData, 'headline' | 'subHeadline'>;

export const HeroStageLeft = memo(
  ({ headline, subHeadline }: HeroStageLeftProps) => {
    const { contact } = useAppStore();
    const [subHeadlineIndex, setSubHeadlineIndex] = useState<number>(0);

    const increment = useCallback(() => {
      const nextIndex = (subHeadlineIndex + 1) % subHeadline.length;
      setSubHeadlineIndex(nextIndex);
    }, [subHeadlineIndex]);

    useEffect(() => {
      const timer = setInterval(increment, 3000);
      return () => clearInterval(timer);
    }, [subHeadlineIndex]);

    return (
      <React.Fragment>
        {headline && (
          <h1
            className={clsx([
              'font-syne',
              'font-bold',
              'text-white',
              'text-2xl',
              'sm:text-3xl',
              'lg:text-4xl',
              'relative',
              'z-10',
            ])}
          >
            {headline}
          </h1>
        )}
        <AnimatePresence mode='wait' initial={false}>
          {subHeadline.map(
            (line, index) =>
              index === subHeadlineIndex && (
                <motion.div
                  key={index}
                  initial={{ translateY: '-200%', opacity: 0 }}
                  animate={{ translateY: '0%', opacity: 1 }}
                  exit={{ translateY: '+200%', opacity: 0 }}
                  transition={{ times: [0, 0.1, 0.9, 1] }}
                  onClick={increment}
                  className={clsx([
                    'font-syne',
                    'font-bold',
                    'text-3xl',
                    'sm:text-4xl',
                    'lg:text-5xl',
                    'text-transparent',
                    'bg-clip-text',
                    'bg-vibrant-october-silence',
                    'select-none',
                    'cursor-pointer',
                    'text-center',
                    'flex',
                    'flex-col',
                    'items-center',
                    'justify-center',
                    'self-center',
                    'h-[3em]',
                    'py-4',
                    'mt-2',
                    'relative',
                    'z-0',
                  ])}
                >
                  <span>{line}</span>
                </motion.div>
              )
          )}
        </AnimatePresence>
        {contact && (
          <ContactModule
            entries={contact as Record<ContactProvider, string>}
            className='relative z-10'
            selection={['mail', 'github', 'instagram', 'xing', 'linkedin']}
          />
        )}
      </React.Fragment>
    );
  }
);
