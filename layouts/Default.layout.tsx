import styled from '@emotion/styled';
import tw from 'twin.macro';
import { NextSeo } from 'next-seo';

import Background from '@components/Background';
import { Navbar } from '@components/Navbar';
import { useSeoProps } from '@lib/seo';

import type { WithChildren, WithProps } from '@typings/common';
import React from 'react';

interface DefaultLayoutProps extends WithChildren {
  seo?: Partial<WithProps<typeof NextSeo>>;
}

const Main = styled.main(tw`flex flex-col justify-center px-8`);

export function DefaultLayout({ children, seo }: DefaultLayoutProps) {
  const seoProps = useSeoProps(seo);

  return (
    <>
      <NextSeo {...seoProps} />
      <Navbar.Standard />
      <Main>
        <Background />
        {children}
      </Main>
    </>
  );
}
