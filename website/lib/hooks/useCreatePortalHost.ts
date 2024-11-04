import React from 'react';

export const useCreatePortalHost = <T extends HTMLElement = HTMLElement>(
  id: string,
  element: keyof HTMLElementTagNameMap = 'div'
): React.RefObject<T | null> => {
  const hostRef = React.useRef<T>(null);

  /**
   *
   */
  React.useEffect((): (() => void) => {
    if (!hostRef.current && document) {
      hostRef.current = (() => {
        let elem = document.getElementById(id);

        if (!elem) {
          elem = document.createElement(element || 'div');
          elem.id = id;
          document.body.appendChild(elem);
        }

        return elem as T;
      })();
    }

    return (): void => {
      if (hostRef.current) {
        document.body.removeChild(hostRef.current);
        hostRef.current = undefined;
      }
    };
  }, []);

  return hostRef;
};
