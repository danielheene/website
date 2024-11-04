import NProgress from 'nprogress';
import Router from 'next/router';
import tw, { GlobalStyles as TailwindStyles } from 'twin.macro';
import { AppProps } from 'next/app';
import { css, Global as EmotionStyles } from '@emotion/react';
import { ThemeProvider } from 'next-themes';

import 'nprogress/nprogress.css';

import { Theme } from '@typings/theme';
import { EasterEggo } from '@components/EasterEggo';
import React from 'react';

NProgress.configure({
  minimum: 0.3,
  easing: 'ease',
  speed: 800,
  showSpinner: false,
});

Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());

const GlobalStyles = css`
  html {
    ${tw`
			antialiased
			bg-gray-900
			text-gray-400
			font-sans
			transition ease-in-out duration-300
		`}
    &.dark {
      * {
        --tw-ring-offset-color: #0c0e10;

        &::selection {
          ${tw`bg-white text-primary-500`}
        }
      }
    }
  }

  *::selection {
    ${tw`bg-white text-primary-500`}
  }

  #nprogress .bar {
    ${tw`h-1 bg-primary-500`}
  }
`;

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider
      attribute='class'
      defaultTheme={Theme.SYSTEM}
      themes={Object.values(Theme)}
    >
      <EmotionStyles styles={GlobalStyles} />
      <TailwindStyles />
      <EasterEggo
        audioPath='/eggls/toasty.mp3'
        imagePath='/eggls/toasty.webp'
      />
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
