import { Children, memo, ReactNode, useId, useMemo, useState } from 'react';
import { CSSRuleObject } from 'tailwindcss/types/config';
import { useOnResizeCallback } from '@lib/hooks';
import { get } from 'lodash-es';

interface MarqueeProps {
  offset?: number;
  speed?: number;
  reverse?: boolean;
  children: ReactNode | ReactNode[];
}

export const Marquee = memo(
  ({ children, offset = 25, speed = 12, reverse = false }: MarqueeProps) => {
    const marqueeId = useId();
    const [marqueeSpeed, setMarqueeSpeed] = useState<number>(speed);

    useOnResizeCallback((event: Event) => {
      const width = get(
        event,
        'currentTarget.innerWidth',
        get(event, 'target.innerWidth', null)
      );
      if (width >= 800 && width < 1200) setMarqueeSpeed(speed * 0.9);
      if (width >= 540 && width < 800) setMarqueeSpeed(speed * 0.75);
      if (width < 540) setMarqueeSpeed(0.5 * speed);
      setMarqueeSpeed(speed);
    }, []);

    const adjustedChildren = useMemo(() => {
      const items = Array.from({ length: 4 }, (_, multiplier) =>
        Children.toArray(children).map((child, index) => {
          const key = [
            marqueeId.toString().padStart(4, '0'),
            multiplier.toString().padStart(4, '0'),
            index.toString().padStart(4, '0'),
          ].join('');

          return (
            <div key={key} className='marquee-item'>
              {child}
            </div>
          );
        })
      );

      return [...items];
    }, [children]);

    const styles: CSSRuleObject = useMemo(
      () => ({
        ['--marquee-offset']: `${offset}%`,
        ['--marquee-duration']: `${marqueeSpeed}s`,
        ['--marquee-initial']: `calc(-25% + var(--marquee-offset))`,
        ['--marquee-final']: `calc(-50% + var(--marquee-offset))`,
        ['--marquee-direction']: `${reverse ? 'reverse' : 'normal'}`,
      }),
      [offset, speed, reverse]
    );

    return (
      <>
        <div className='marquee' style={styles}>
          <div className='marquee-inner' role='marquee'>
            {adjustedChildren}
          </div>
        </div>
        <style jsx>{`
          @keyframes marquee {
            0% {
              transform: translate3d(var(--marquee-initial), 0, 0);
            }

            100% {
              transform: translate3d(var(--marquee-final), 0, 0);
            }
          }

          .marquee {
            position: relative;
            overflow: hidden;
          }

          .marquee :global(.marquee-inner) {
            position: relative;
            width: fit-content;
            display: flex;
            flex-direction: row;
            transform: translate3d(var(--marquee-initial), 0, 0);
            animation-direction: var(--marquee-direction);
            animation-timing-function: linear;
            animation-name: marquee;
            animation-play-state: running;
            animation-iteration-count: infinite;
            animation-duration: var(--marquee-duration);
          }

          .marquee :global(.marquee-item) {
            margin: 1rem !important;
            flex-shrink: 0 !important;
            flex-grow: 0 !important;
            width: 16rem;
          }
        `}</style>
      </>
    );
  }
);
