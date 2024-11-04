import React, { Fragment, useMemo } from 'react';
import { AnimatePresence, domAnimation, LazyMotion } from 'framer-motion';
import { get, isObject } from 'lodash-es';
import { DefaultSeo, NextSeo } from 'next-seo';
import { Analytics } from '@vercel/analytics/react';

import SEO from '../seo.config';
import { useAppStore } from '@lib/appStore';
import { isBrowser } from '@lib/utils';
import { useIsomorphicLayoutEffect } from '@lib/hooks';
import { pageTransition } from '@lib/transitions';
import { Toasty } from '@components/Toasty';
import { HireMeMemoji } from '@components/HireMeMemoji';
import { GradientBackground } from '@components/GradientBackground';

import '../styles/globals.css';
import '../styles/font-inter.css';
import '../styles/font-jetbrains-mono.css';
import '../styles/font-syne.css';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { Header } from '@components/Header';
import { Footer } from '@components/Footer/Footer';
import { AppProps } from 'next/app';
import { MetaDataResponse } from '@lib/types';
import { MetaTag } from 'next-seo/lib/types';
import { PreviewBanner } from '@components/PreviewBanner';

export { reportWebVitals } from 'next-axiom';

export default function App({
  Component,
  pageProps = {},
  router,
}: AppProps): JSX.Element {
  const { appConfig, preview, ...componentProps } = pageProps;
  const { asPath } = router;

  const { features, setAppConfig, setRouteChanging, setPreviousRoute } =
    useAppStore();

  useIsomorphicLayoutEffect(() => {
    // TODO: move metadata to own object in sanity
    const nextConfig = isObject(appConfig)
      ? Object.fromEntries(
          Object.entries(appConfig).filter(
            ([key]) =>
              !['title', 'defaultTitle', 'titleTemplate'].includes(key) &&
              !key.startsWith('meta')
          )
        )
      : {};

    setAppConfig(nextConfig);
  }, [appConfig]);

  const metaConfig = useMemo(() => {
    // TODO: move metadata to own object in sanity
    const defaultMeta: Partial<MetaDataResponse> = !!appConfig
      ? Object.fromEntries(
          Object.entries(appConfig).filter(
            ([key]) =>
              ['title', 'defaultTitle', 'titleTemplate'].includes(key) ||
              key.startsWith('meta')
          )
        )
      : {};

    // TODO: move metadata to own object in sanity
    const pageMeta: Partial<MetaDataResponse> = !!pageProps
      ? Object.fromEntries(
          Object.entries(pageProps).filter(
            ([key]) =>
              ['title', 'defaultTitle', 'titleTemplate'].includes(key) ||
              key.startsWith('meta')
          )
        )
      : {};

    return {
      title: (defaultMeta?.title || pageMeta?.title || '').trim(),
      titleTemplate: (
        defaultMeta?.titleTemplate ||
        pageMeta?.titleTemplate ||
        ''
      ).trim(),
      description: (
        defaultMeta?.metaDescription ||
        pageMeta?.metaDescription ||
        ''
      ).trim(),
      tags: (defaultMeta?.metaTags?.length > 0 || pageMeta?.metaTags?.length > 0
        ? defaultMeta?.metaTags?.length > pageMeta?.metaTags?.length
          ? defaultMeta?.metaTags
          : pageMeta?.metaTags
        : []
      ).map(({ attribute, value, content, type }): MetaTag => {
        if (type === 'httpEquiv')
          return {
            httpEquiv: attribute as MetaTag['httpEquiv'],
            content,
            name: undefined,
            property: undefined,
          };

        if (type === 'name')
          return {
            name: value,
            content,
            property: undefined,
            httpEquiv: undefined,
          };

        if (type === 'property')
          return {
            property: value,
            content,
            name: undefined,
            httpEquiv: undefined,
          };
      }),
      keywords:
        defaultMeta?.metaKeywords?.length > 0 ||
        pageMeta?.metaKeywords?.length > 0
          ? defaultMeta?.metaKeywords?.length > pageMeta?.metaKeywords?.length
            ? defaultMeta?.metaKeywords
            : pageMeta?.metaKeywords
          : [],
    };
  }, [pageProps, appConfig]);

  /**
   * bind router events
   */
  React.useEffect(() => {
    router.events.on('routeChangeStart', (_, { shallow }) => {
      if (shallow) return;
      if (isBrowser) {
        document.documentElement.classList.add('is-loading');
      }

      setRouteChanging(true);
      setPreviousRoute(asPath);
    });

    router.events.on('routeChangeComplete', () => {
      if (isBrowser) {
        document.documentElement.classList.remove('is-loading');
      }
      setTimeout(() => setRouteChanging(false), pageTransition.speed);
    });

    router.events.on('routeChangeError', () => {
      if (isBrowser) {
        document.documentElement.classList.remove('is-loading');
      }
      setRouteChanging(false);
    });
  }, [setRouteChanging, asPath]);

  const { hireMeWidget, easterEggWidget } = features || {};
  const { metaNavigation, contact, assets } = appConfig || {};
  const id = get(router, 'asPath', 'home');

  return (
    <TooltipProvider delayDuration={0}>
      <DefaultSeo {...{ ...SEO }} />
      <NextSeo {...metaConfig} />
      <PreviewBanner preview={preview} />

      <LazyMotion features={domAnimation}>
        <AnimatePresence mode='wait'>
          <Fragment key={id}>
            <Header />
            <Component key={id} {...componentProps} />
            <Footer
              metaNavigation={metaNavigation}
              contact={contact}
              assets={assets}
            />
          </Fragment>
        </AnimatePresence>
      </LazyMotion>

      {easterEggWidget && (
        <Toasty
          audioPath='/toasty/toasty.mp3'
          imagePath='/toasty/toasty.webp'
        />
      )}
      {hireMeWidget && <HireMeMemoji />}
      <GradientBackground darkenTop={true} />
      <Analytics />
    </TooltipProvider>
  );
}
