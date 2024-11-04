import { ReactNode } from 'react';
import clsx from 'clsx';

import { Box } from '@components/Box';

interface SectionProps {
  children: ReactNode | ReactNode[];
  fullWidth?: boolean;
}

export const Section = (props: SectionProps): JSX.Element => {
  const { children, fullWidth = false } = props;

  return (
    <>
      <Box
        as='section'
        className={clsx(
          'section',
          'relative',
          'w-screen',
          'pt-32',
          'first-of-type:pt-0',
          'scroll-m-4',
        )}
      >
        <div
          className={clsx([
            'section-spacer',
            'container',
            'max-w-screen',
            'sm:max-w-screen-sm',
            'md:max-w-screen-md',
            'lg:max-w-screen-lg',
            'xl:max-w-screen-xl',
            '2xl:max-w-screen-2xl',
          ])}
          aria-hidden={true}
          tabIndex={-1}
        />

        <Box
          className={clsx(
            'section-content',
            'py-32',
            !fullWidth && 'container'
          )}
        >
          {children}
        </Box>
      </Box>
      <style jsx>
        {`
          :global(.section > .section-spacer::before) {
            content: ' ';
            display: block;
            width: 100%;
            border-top: 1px solid;
          }
        `}
      </style>
    </>
  );
};
