import React from 'react';

interface Options extends IntersectionObserverInit {
  triggerOnce?: boolean;
}

export const useIntersectionObserver = (
  options?: Options
): [boolean, (element: Element) => void] => {
  const { triggerOnce } = options;
  const elementRef = React.useRef<Element | null>(null);
  const [isIntersecting, setIsIntersecting] = React.useState<boolean>(false);
  const setElement = (element: Element = null): void => {
    elementRef.current = element;
  };

  React.useEffect(() => {
    let observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    if (isIntersecting && triggerOnce && elementRef.current && observer) {
      observer.unobserve(elementRef.current);
      observer = null;
    }

    return () => {
      if (elementRef.current && observer) {
        observer.unobserve(elementRef.current);
        observer = null;
      }
    };
  }, []);

  return [isIntersecting, setElement];
};
