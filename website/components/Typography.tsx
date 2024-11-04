import React from 'react';
import clsx, { ClassValue } from 'clsx';

import { mergeRefs } from '@lib/utils';
import {
  PolymorphicComponentPropWithRef,
  PolymorphicRef,
  TypographyVariant,
} from '@lib/types';

const defaultElement = 'span';

type TypographyProps<C extends React.ElementType> =
  PolymorphicComponentPropWithRef<
    C,
    {
      // as?: ElementType;
      children: React.ReactNode | React.ReactNode[];
      variant: `${TypographyVariant}`;
      className?: ClassValue;
    }
  >;

type TypographyComponent = <
  C extends React.ElementType = typeof defaultElement
>(
  props: TypographyProps<C>
) => React.ReactElement | null;

export const Typography: TypographyComponent = React.memo(
  React.forwardRef(
    <C extends React.ElementType = typeof defaultElement>(
      { as, children, className, variant, ...props }: TypographyProps<C>,
      forwardedRef?: PolymorphicRef<C>
    ) => {
      const Component = as || defaultElement;

      const localRef = React.createRef<HTMLSpanElement>();
      const mergedRef = mergeRefs([localRef, forwardedRef]);

    const classList = React.useMemo(() => {
      switch (variant) {
        case 'section-title':
          return clsx([
            'font-syne',
            'font-bold',
            'text-4xl',
            'md:text-6xl',
            'lg:text-8xl',
            'text-transparent',
            'bg-clip-text',
            'bg-headline',
            className,
          ]);
        case 'section-subtitle':
          return clsx([
            'font-syne',
            'font-bold',
            'text-xl',
            'md:text-2xl',
            'lg:text-4xl',
            className,
          ]);
        case 'section-caption':
          return clsx([
            'font-syne',
            'font-semibold',
            'text-sm',
            'md:text-md',
            'uppercase',
            className,
          ]);
        case 'body':
          return clsx([
            'font-inter',
            'font-normal',
            'text-lg',
            'lg:text-2xl',
            'leading-relaxed',
            className,
          ]);
        case 'button-default':
          return clsx([
            'relative',
            'font-medium',
            'font-mono',
            'text-white',
            'before:absolute',
            'before:-bottom-0.5',
            'before:left-0',
            'before:h-px',
            'before:w-full',
            'before:origin-left',
            'before:scale-x-0',
            'before:bg-white',
            'before:transition-all',
            'before:duration-100',
            'hover:before:scale-x-100',
            'hover:no-underline',
            className,
          ]);
        case 'button-primary':
          return clsx([
            'inline-flex',
            'gap-2',
            'cursor-pointer',
            'items-center',
            'justify-center',
            'rounded-xl',
            'bg-primary-600',
            'px-4',
            'py-2',
            'text-lg',
            'font-semibold',
            'text-white',
            'shadow-sm',
            'hover:no-underline',
            'transition-colors',
            'hover:bg-primary-500',
            'hover:no-underline',
            'focus:outline-none',
            'focus:ring-2',
            'focus:ring-orange-400/80',
            'focus:ring-offset-0',
            'disabled:opacity-30',
            'disabled:hover:border-primary',
            'disabled:hover:bg-primary',
            'disabled:hover:text-white',
            'dark:focus:ring-white/80',
            'hover:no-underline',
            className,
          ]);
        case 'button-outlined':
          return clsx([
            'inline-flex',
            'gap-2',
            'cursor-pointer',
            'items-center',
            'justify-center',
            'rounded-xl',
            'border-2',
            'border-white',
            'transition-colors',
            'duration-300',
            'bg-transparent',
            'pl-1.5',
            'pr-2.5',
            'py-2',
            'text-lg',
            'font-medium',
            'text-text',
            'shadow-sm',
            'hover:text-primary-600',
            'hover:bg-white',
            // 'focus:text-white',
            // 'focus:outline-none',
            // 'focus:ring-2',
            // 'focus:ring-orange-400/80',
            // 'focus:ring-offset-0',
            'disabled:opacity-30',
            'disabled:hover:text-text',
            'dark:focus:ring-white/80',
            className,
          ]);
        case 'button-ghost':
          return clsx([
            'inline-flex',
            'gap-2',
            'cursor-pointer',
            'items-center',
            'justify-center',
            'rounded-xl',
            'border-2',
            'border-transparent',
            'bg-transparent',
            'px-4',
            'py-2.5',
            'text-lg',
            'font-semibold',
            'text-text',
            'hover:bg-heading/5',
            'focus:bg-heading/5',
            'focus:outline-none',
            'focus:ring-2',
            'focus:ring-heading/80',
            'focus:ring-offset-0',
            'disabled:opacity-30',
            'disabled:hover:bg-transparent',
            'disabled:hover:text-text',
            className,
          ]);
      }
    }, [variant, className]);

      return (
        <Component
          ref={mergedRef}
          className={classList}
          {...props}
        >
          {children}
        </Component>
      );
    }
  )
);
