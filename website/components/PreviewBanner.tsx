import { Icon } from '@iconify/react';
import { isBrowser } from '@lib/utils';
import clsx from 'clsx';
import { useRouter } from 'next/router';
import React from 'react';

export const PreviewBanner = ({
  preview,
}: {
  preview: boolean;
}): JSX.Element | null => {
  const [hover, setHover] = React.useState<boolean>(false);
  const router = useRouter();

  const handleDisableClick = React.useCallback(() => {
    if (isBrowser) {
      fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/preview?disable=1`)
        .then(({ ok }) => {
          if (ok) router.reload();
        })
        .catch(console.log);
    }
  }, [router]);

  return preview ? (
    <div
      className={clsx(
        'fixed',
        'left-1/2',
        'top-0',
        '-translate-x-1/2',
        'z-max',
        'bg-black',
        'px-2.5',
        'rounded-b-xl'
      )}
    >
      <button
        className={clsx([
          'relative',
          'flex',
          'justify-center',
          'items-center',
          'h-8',
          'px-8',

          'text-white',
          'text-lg',
          'font-mono',
          'font-bold',
        ])}
        onClick={handleDisableClick}
        onMouseEnter={() => setHover(true)}
        onMouseMove={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <span className='leading-[0px]'>PREVIEW MODE</span>
        <Icon
          icon='mdi:close'
          className={clsx(
            'absolute',
            'right-0',
            'top-1/2',
            '-translate-y-1/2',
            'text-[150%]',
            'duration-100',
            hover
              ? ['opacity-100', 'pointer-events-auto']
              : ['opacity-0', 'pointer-events-none']
          )}
        />
      </button>
    </div>
  ) : null;
};
