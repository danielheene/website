import React from 'react';
import ReactDOM from 'react-dom';
import Image from 'next/image';
import clsx from 'clsx';
import { useCreatePortalHost } from '@lib/hooks';

const PORTAL_ID = 'MemojiPortal';
export const HireMeMemoji = React.memo((): JSX.Element => {
  const portalRef = useCreatePortalHost(PORTAL_ID);
  const [showMemoji, setShowMemoji] = React.useState(false);
  const [showText, setShowText] = React.useState(false);

  React.useEffect(() => {
    if (window && window.innerWidth > 700 && window.innerHeight > 700) {
      setTimeout(() => {
        setShowMemoji(true);
      }, 10000);
    }
  }, []);

  return portalRef.current
    ? ReactDOM.createPortal(
        <div className='w-64 h-64 flex flex-col justify-center items-center fixed bottom-0 left-0'>
          <div className='w-full h-full relative'>
            {showMemoji && (
              <Image
                className='animate-fade-in'
                src='/memoji_whisper.webp'
                width={500}
                height={500}
                alt='Memoji Image'
                onAnimationEnd={() => setShowText(true)}
              />
            )}
            {showText && (
              <a
                className={clsx([
                  'animate-fade-in',
                  'absolute',
                  'left-3/4',
                  'top-1/2',
                  'bg-primary-500',
                  'text-white',
                  'flex',
                  'justify-center',
                  'items-center',
                  'w-56',
                  'h-12',
                  'rounded-md',
                  'font-semibold',
                  'opacity-0',
                  "after:content-[' ']",
                  'after:w-0',
                  'after:h-0',
                  'after:absolute',
                  'after:right-full',
                  'after:top-3/4',
                  'after:-translate-y-full',
                  'after:border-t-[10px]',
                  'after:border-t-transparent',
                  'after:border-b-[5px]',
                  'after:border-b-transparent',
                  'after:border-r-[20px]',
                  'after:border-r-primary-500',
                ])}
                href='mailto:daniel@heene.io'
              >
                I am available for hiring!
              </a>
            )}
          </div>
        </div>,
        portalRef.current
      )
    : null;
});
