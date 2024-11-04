import { DependencyList, useCallback, useEffect, useRef } from 'react';

export const useOnResizeCallback = (
  cb: (event?: UIEvent) => void,
  dependencies: DependencyList,
  triggerInitial: boolean = false
): void => {
  const triggered = useRef<boolean>(false);
  const callback = useCallback(cb, dependencies);

  useEffect(() => {
    if (triggerInitial && !triggered.current) {
      triggered.current = true;
      callback();
    }
  }, []);

  useEffect(() => {
    window.addEventListener('resize', callback, false);
    return () => window.removeEventListener('resize', callback, false);
  }, [callback]);
};
