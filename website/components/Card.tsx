import {
  forwardRef,
  HTMLAttributes,
  ReactNode,
  RefObject,
} from 'react';
import clsx, { ClassValue } from 'clsx';

import { Box } from '@components/Box';

interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className'> {
  className?: ClassValue;
  children?: ReactNode | ReactNode[];
  variant?: 'light' | 'dark';
  container?: boolean;
  radius?: boolean;
  as?: keyof HTMLElementTagNameMap;
}

export const Card = forwardRef(
  (
    {
      children,
      className,
      variant = 'light',
      container = false,
      radius = true,
      ...otherProps
    }: CardProps,
    ref: RefObject<HTMLDivElement>
  ): JSX.Element => {
    return (
      <Box
        ref={ref}
        {...otherProps}
        className={clsx(
          [
            (variant === 'light' || variant === 'dark') && 'glass',
            variant === 'light' && 'glass-light',
            variant === 'dark' && 'glass-dark',
            container && 'container',
            radius && 'rounded-lg',
            !container && 'p-6',
          ],
          className
        )}
      >
        {children}
      </Box>
    );
  }
);
