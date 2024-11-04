import React from 'react';
import { isBrowser } from '@lib/utils';

export const useIsomorphicLayoutEffect = isBrowser
  ? React.useLayoutEffect
  : React.useEffect;
