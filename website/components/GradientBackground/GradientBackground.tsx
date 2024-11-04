import { CSSProperties, useEffect, useMemo, useRef, useState } from 'react';

import { Gradient } from './Gradient';
import { useAppStore } from '@lib/appStore';
import clsx from 'clsx';

const canvasId = 'gradient-background';

interface IGradient extends Gradient {
  initGradient: (selector: string) => void;
  connect: () => Promise<void>;
  play: () => void;
  pause: () => void;
}

type GradientColors = [string, string, string, string];

interface GradientBackgroundProps {
  darkenTop?: boolean;
  transitionIn?: boolean;
  colors?: GradientColors;
}

export const GradientBackground = ({
  darkenTop = false,
  transitionIn = true,
  colors = ['#ea33df', '#312c90', '#7126af', '#e77d60'],
}: GradientBackgroundProps): JSX.Element => {
  const [ready, setReady] = useState<boolean>(false);
  const { animateBackground } = useAppStore();
  const canvasRef = useRef<HTMLCanvasElement>();
  const gradientRef = useRef<IGradient>();

  useEffect(() => {
    (async () => {
      if (!gradientRef.current && canvasRef.current) {
        gradientRef.current = new Gradient() as IGradient;
        gradientRef.current.initGradient(`#${canvasId}`);
        await gradientRef.current.connect();
        setReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (animateBackground && gradientRef.current) {
      gradientRef.current.play();
    } else if (!animateBackground && gradientRef.current) {
      gradientRef.current.pause();
    }
  }, [animateBackground, ready]);

  const colorProperties = useMemo(() => {
    return colors.reduce(
      (previousValue, currentValue, currentIndex) =>
        Object.assign(previousValue, {
          [`--gradient-color-${currentIndex + 1}`]: currentValue,
        }),
      {}
    ) as CSSProperties;
  }, []);

  const dataDarkenTopProp = darkenTop ? { 'data-darken-top': 'true' } : {};
  const dataTransitionInProp = transitionIn
    ? { 'data-transition-in': 'true' }
    : {};

  return (
    <canvas
      id={canvasId}
      ref={canvasRef}
      {...dataDarkenTopProp}
      {...dataTransitionInProp}
      style={colorProperties}
      className={clsx([
        'fixed',
        'block',
        'inset-0',
        'w-screen',
        'h-screen',
        'z-[-10]',
        'transition-opacity',
        'duration-1000',
        ready ? 'opacity-100' : 'opacity-0',
      ])}
    />
  );
};
