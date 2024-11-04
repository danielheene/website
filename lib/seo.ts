import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';

import type { ComponentProps } from 'react';

export function useSeoProps(
  props: Partial<ComponentProps<typeof NextSeo>> = {}
): Partial<ComponentProps<typeof NextSeo>> {
  const router = useRouter();

  const title = 'daniel.heene.io ─ home';
  const description =
    "Hey 👋 I'm Daniel, a frontend engineer with focus on React, Next.js & Typescript";

  return {
    title,
    description,
    canonical: `https://daniel.heene.io/${router.asPath}`,
    openGraph: {
      title,
      description,
      site_name: 'daniel.heene.io',
      url: `https://daniel.heene.io/${router.asPath}`,
      type: 'website',
      images: [
        {
          url: '/banner.webp',
          alt: description,
          width: 1280,
          height: 720,
        },
      ],
    },
    twitter: {
      cardType: 'summary_large_image',
      handle: '@danielheene',
      site: '@danielheene',
    },
    ...props,
  };
}
