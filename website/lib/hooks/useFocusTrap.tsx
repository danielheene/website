import React, { memo, MutableRefObject, Ref, useEffect, useState } from 'react';

import { isForwardRef } from 'react-is';
import { isObject } from 'lodash-es';

const focusableSelector = [
  'a[href]:not([tabindex^="-"])',
  'area[href]:not([tabindex^="-"])',
  'input:not([type="hidden"]):not([type="radio"]):not([disabled]):not([tabindex^="-"])',
  'input[type="radio"]:not([disabled]):not([tabindex^="-"])',
  'select:not([disabled]):not([tabindex^="-"])',
  'textarea:not([disabled]):not([tabindex^="-"])',
  'button:not([disabled]):not([tabindex^="-"])',
  'iframe:not([tabindex^="-"])',
  'audio[controls]:not([tabindex^="-"])',
  'video[controls]:not([tabindex^="-"])',
  '[contenteditable]:not([tabindex^="-"])',
  '[tabindex]:not([tabindex^="-"])',
].join(',');

type FocusTrapReturnValue = [boolean, (n: boolean) => void];
type FocusTrapRef = MutableRefObject<HTMLElement> | Ref<HTMLElement>;
type FocusTrapSortedArgs = [FocusTrapRef, FocusTrapOpts];
type FocusTrapOpts<T = {}> = {
  restoreOnExit: boolean;
} & T;

const defaultOpts: FocusTrapOpts = {
  restoreOnExit: false,
};

export const useFocusTrap: {
  (options: FocusTrapOpts<{ ref: FocusTrapRef }>): FocusTrapReturnValue;
  (ref: FocusTrapRef, options: FocusTrapOpts): FocusTrapReturnValue;
  (options: FocusTrapOpts, ref: FocusTrapRef): FocusTrapReturnValue;
} = (...args): FocusTrapReturnValue => {
  const firstIsObject = isObject(args[0]) && !Array.isArray(args[0]);
  const firstIsRef = isForwardRef(args[0]) && !firstIsObject;
  const secondIsObject = isObject(args[1]) && !Array.isArray(args[1]);
  const secondIsRef = isForwardRef(args[1]) && !firstIsObject;
  const [isActive, setIsActive] = useState<boolean>(false);

  let sortedArgs: FocusTrapSortedArgs;
  if (args.length === 1 && firstIsObject) {
    sortedArgs = Object.keys(args[0]).reduce(
      (prev, curr) => {
        if (curr === 'ref') {
          prev[0] = args[0][curr];
        } else {
          prev[1][curr] = args[0][curr];
        }
        return prev;
      },
      [undefined, {}] as FocusTrapSortedArgs
    );
  } else if (args.length === 1 && firstIsRef) {
    sortedArgs = [args[0], { ...defaultOpts }];
  } else if (args.length === 2 && firstIsObject && secondIsRef) {
    sortedArgs = Object.keys(args[0]).reduce(
      (prev, curr) => {
        if (curr === 'ref') {
          prev[0] = args[0][curr];
        } else {
          prev[1][curr] = args[0][curr];
        }
        return prev;
      },
      [args[1], {}] as FocusTrapSortedArgs
    );
  } else if (args.length === 2 && firstIsRef && secondIsObject) {
    sortedArgs = [args[0], { ...defaultOpts, ...args[1] }];
  }
  const [ref, { restoreOnExit }] = sortedArgs;
  const rootRef = React.useRef<HTMLDivElement>();
  const anchorRef = React.useRef<HTMLElement>();
  const focusedRef = React.useRef<HTMLElement>();

  useEffect(() => {
    if (restoreOnExit && document?.activeElement && !anchorRef.current) {
      anchorRef.current = document.activeElement as HTMLElement;
    }

    return () => {
      if (anchorRef.current) {
        anchorRef.current?.focus();
      }
    };
  }, []);

  const focusElement = React.useCallback((element: HTMLElement) => {
    const interval: NodeJS.Timer | number = setInterval(() => {
      if (document.activeElement === element) {
        focusedRef.current = element;
        clearInterval(interval);
      } else {
        element?.focus();
      }
    }, 25);
  }, []);

  useEffect(() => {
    if (rootRef.current && !focusedRef.current) {
      const elements = rootRef.current.querySelectorAll(focusableSelector);
      const nextFocus = Array.from(elements).at(0) as HTMLElement;
      focusElement(nextFocus);
    }
  }, [focusElement]);

  const handleFocus = React.useCallback(
    (event: KeyboardEvent) => {
      if (!rootRef.current || !focusedRef.current || event.key !== 'Tab')
        return;

      event.preventDefault();
      const elements = rootRef.current.querySelectorAll(focusableSelector);
      const currentPosition = Array.from(elements).indexOf(focusedRef.current);
      const nextPosition =
        (currentPosition + (event.shiftKey ? elements.length - 1 : 1)) %
        elements.length;
      const nextFocus = elements[nextPosition] as HTMLElement;
      focusElement(nextFocus);
    },
    [focusElement]
  );

  useEffect(() => {
    window?.addEventListener('keydown', handleFocus, false);
    return () => {
      window?.removeEventListener('keydown', handleFocus, false);
    };
  }, [handleFocus]);

  return [isActive, setIsActive];
};
