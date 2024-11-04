import React, { useRef } from 'react';
import clsx from 'clsx';

import { Box } from '@components/Box';
import { Logo } from '@components/Logo';
import { useAppStore } from '@lib/appStore';
import { useOnResizeCallback } from '@lib/hooks';
import { Typography } from '@components/Typography';
import { Icon } from '@iconify/react';

export const Header = (): JSX.Element => {
  const headerRef = useRef<HTMLDivElement>();
  const { setHeaderHeight, showNavigation, assets } = useAppStore();

  useOnResizeCallback(
    () => {
      if (headerRef.current) {
        const { height } = headerRef.current.getBoundingClientRect();
        setHeaderHeight(height);
      }
    },
    [],
    true
  );

  return (
    <header className='min-h-36'>
      <Box
        ref={headerRef}
        className={clsx([
          'container',
          'relative',
          'flex',
          'flex-row',
          'items-center',
          'justify-between',
          'py-6',
          showNavigation ? 'z-menu-button' : 'z-header',
        ])}
      >
        <Logo size='text-header' />

        {assets?.resume && (
          <Typography
            as='a'
            variant='button-primary'
            href={assets?.resume?.url}
            target='_blank'
            rel='noopener noreferrer'
            download={assets?.resume?.originalFilename}
          >
            Resume
            <Icon icon='mdi:tray-arrow-down' className='ml-2 text-[120%]' />
          </Typography>
        )}
        {/*<NavigationMenuButton*/}
        {/*  className={clsx([*/}
        {/*    'xl:hidden',*/}
        {/*    'relative',*/}
        {/*    'text-header',*/}
        {/*    'z-menu-button',*/}
        {/*  ])}*/}
        {/*  isOpen={showNavigation}*/}
        {/*  onClick={() => setShowNavigation(!showNavigation)}*/}
        {/*/>*/}
        {/*<NavigationDropdown />*/}
      </Box>
    </header>
  );
};
