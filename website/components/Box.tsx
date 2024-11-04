/**
 * polymorphic Box component
 * inspired by the following article
 *
 * article:     https://blog.logrocket.com/build-strongly-typed-polymorphic-components-react-typescript/
 * repository:  https://github.com/ohansemmanuel/polymorphic-react-component
 */

import React from 'react';
import { PolymorphicComponentPropWithRef, PolymorphicRef } from '@lib/types';

const defaultElement = 'div';

type BoxProps<C extends React.ElementType> = PolymorphicComponentPropWithRef<
  C,
  { color?: string | 'black' }
>;

type BoxComponent = <C extends React.ElementType = typeof defaultElement>(
  props: BoxProps<C>
) => React.ReactElement | null;

export const Box: BoxComponent = React.forwardRef(
  <C extends React.ElementType = typeof defaultElement>(
    { as, children, ...otherProps }: BoxProps<C>,
    ref?: PolymorphicRef<C>
  ) => {
    const Component = as || defaultElement;

    return (
      <Component ref={ref} {...otherProps}>
        {children}
      </Component>
    );
  }
);
