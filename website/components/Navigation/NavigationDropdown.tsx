import React, { ReactNode, useRef } from 'react';
import { useRouter } from 'next/router';
import { ClassValue, clsx } from 'clsx';
import { motion } from 'framer-motion';

import { useAppStore } from '@lib/appStore';
import { useDimensions } from '@lib/hooks';

const menuItemVariants = {
  open: {
    y: 0,
    opacity: 1,
    transition: {
      y: { stiffness: 1000, velocity: -100 },
    },
  },
  closed: {
    y: 50,
    opacity: 0,
    transition: {
      y: { stiffness: 1000 },
    },
  },
};

const colors = ['#FF008C', '#D309E1', '#9C1AFF', '#7700FF', '#4400FF'];

export const MenuItem = ({ i }) => {
  const style = { border: `2px solid ${colors[i]}` };
  return (
    <motion.li
      className={clsx(
        'flex',
        'items-center',
        'list-none',
        'py-4',
        'cursor-pointer'
      )}
      variants={menuItemVariants}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className='icon-placeholder' style={style} />
      <div className='text-placeholder' style={style} />
      <style jsx>
        {`
          :global(.li) {
            margin: 0 0 20px 0;
            padding: 0;
            list-style: none;
            display: flex;
            align-items: center;
            cursor: pointer;
          }

          .icon-placeholder {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            flex: 40px 0;
            margin-right: 20px;
          }

          .text-placeholder {
            border-radius: 5px;
            width: 200px;
            height: 20px;
            flex: 1;
          }
        `}
      </style>
    </motion.li>
  );
};

const navigationVariants = {
  open: {
    transition: { staggerChildren: 0.07, delayChildren: 0.2 },
  },
  closed: {
    transition: { staggerChildren: 0.05, staggerDirection: -1 },
  },
};

export const Navigation = () => {
  const { headerHeight } = useAppStore();
  return (
    <motion.ul
      className={clsx(
        'absolute',
        'flex',
        'flex-col',
        'items-center',
        'top-0',
        'right-0',
        'bottom-0',
        'w-full',
        'm-0',
        'p-8',
        'z-off-canvas'
      )}
      style={{ marginTop: `${headerHeight}px` }}
      variants={navigationVariants}
    >
      {itemIds.map((i) => (
        <MenuItem i={i} key={i} />
      ))}
    </motion.ul>
  );
};

const itemIds = [0, 1, 2, 3, 4];

const sidebar = {
  open: (height = 1000) => ({
    clipPath: `circle(${height * 2 + 200}px at 100% 0%)`,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 20,
      restDelta: 2,
    },
  }),
  closed: {
    clipPath: 'circle(1px at 100% 0%)',
    opacity: 1,
    transition: {
      delay: 0.5,
      type: 'spring',
      stiffness: 400,
      damping: 40,
    },
    transitionEnd: {
      opacity: 0,
    },
  },
};

/**
 *
 */

interface NavigationDropdownProps {
  className?: ClassValue;
  children?: ReactNode | ReactNode[];
}

export const NavigationDropdown = ({
  className,
  children,
}: NavigationDropdownProps): JSX.Element => {
  const containerRef = useRef(null);
  const { height } = useDimensions(containerRef);
  const { showNavigation, setShowNavigation, headerHeight } = useAppStore();
  const router = useRouter();

  /** close off-canvas on route changes */
  const handleRouteChangeStart = React.useCallback(() => {
    setShowNavigation(false);
  }, [setShowNavigation]);

  /** close off-canvas */
  const handleClose = React.useCallback(
    () => setShowNavigation(false),
    [setShowNavigation]
  );

  const handleKeyPress = React.useCallback(
    (event: KeyboardEvent) => {
      if ((event.key === 'Esc' || event.key === 'Escape') && showNavigation) {
        handleClose();
      }
    },
    [handleClose, showNavigation]
  );

  /** bind route change events */
  React.useEffect(() => {
    router.events.on('routeChangeStart', handleRouteChangeStart);
    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
    };
  }, [handleRouteChangeStart, router.events]);

  /** bind close key */
  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyPress, false);
    return () => {
      window.removeEventListener('keydown', handleKeyPress, false);
    };
  }, [handleKeyPress]);

  /** disables page scrolling when off-canvas is open */
  React.useEffect(() => {
    document.body.style.overflowY = showNavigation ? 'hidden' : '';
  }, [showNavigation]);

  return (
    <>
      <motion.nav
        initial={false}
        animate={showNavigation ? 'open' : 'closed'}
        custom={height}
        ref={containerRef}
        className={clsx([
          'absolute',
          'top-0',
          'right-0',
          'w-screen',
          // 'w-max-screen',
          'h-screen',
          'z-off-canvas',
          'pointer-events-none',
          !showNavigation && 'pointer-events-none',
          className,
        ])}
      >
        <motion.div
          initial={false}
          className={clsx([
            'absolute',
            'top-0',
            'right-0',
            'w-full',
            'h-full',
            'bg-white/50',
            'z-off-canvas',
            'backdrop-blur-2xl',
          ])}
          variants={sidebar}
        />
        <Navigation />
      </motion.nav>
    </>
  );
};
