import React, { MouseEvent } from 'react';
import clsx, { ClassValue } from 'clsx';

import { NavigationBurgerIcon } from './NavigationBurgerIcon';

interface NavigationMenuButtonProps {
  className?: ClassValue;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  isOpen?: boolean;
}

export const NavigationMenuButton = ({
  className,
  isOpen = false,
  onClick = () => undefined,
}: NavigationMenuButtonProps): JSX.Element => {
  return (
    <div
      className={clsx([
        'inline-block',
        'relative',
        'w-[1em]',
        'h-[1em]',
        'ml-auto',
        'box-border',
        className,
      ])}
    >
      <button
        className={clsx([
          'absolute',
          'inset-0',
          'flex',
          'items-center',
          'justify-center',
          'w-[1em]',
          'h-[1em]',
          'box-border',
          'rounded-3',
          'outline-offset-0',
          'text-white',
          isOpen && 'z-menu-button',
          className,
        ])}
        type='button'
        onClick={onClick}
        aria-label={isOpen ? 'Close Navigation' : 'Open Navigation'}
      >
        <NavigationBurgerIcon
          className={clsx('scale-90', '!outline-0')}
          open={isOpen}
        />
      </button>
    </div>
  );
};
