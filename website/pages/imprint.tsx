import { useRouter } from 'next/router';
import { useAppStore } from '@lib/appStore';
import clsx from 'clsx';
import { Typography } from '@components/Typography';
import { Icon } from '@iconify/react';
import { PortableText } from '@components/PortableText';
import React from 'react';
import { GetStaticProps, NextPage } from 'next';
import Sanity, {  fetchAppConfig, imprintQuery } from '@lib/sanity';
import { TypedObject } from '@sanity/types';

const ImprintPage: NextPage = (props) => {
  const router = useRouter();
  const { title, body } = props as {
    title: string;
    body: TypedObject | TypedObject[];
  };
  const { previousRoute } = useAppStore();

  return (
    <>
      <article
        className={clsx(['container', 'grid', 'grid-cols-12', 'gap-y-12'])}
      >
        <div className={clsx(['col-start-2', 'col-span-10'])}>
          <Typography as='h1' variant='section-title' className='text-center'>
            {title}
          </Typography>
        </div>

        <nav
          className={clsx([
            'col-start-3',
            'col-span-8',
            'flex',
            'flex-col',
            'md:flex-row',
            'justify-end',
          ])}
        >
          <button
            className={clsx([
              'text-2xl',
              'flex',
              'flex-row',
              'gap-1',
              'font-mono',
              'uppercase',
              'items-center',
              'font-semibold',
              'mr-auto',
            ])}
            onClick={() => (previousRoute ? router.back() : router.push('/'))}
          >
            <Icon className={'text-3xl'} icon='mdi:arrow-left' />
            Go Back
          </button>
        </nav>

        {body && (
          <div
            className={clsx([
              'col-start-3',
              'col-span-8',
              'rounded-lg',
              'bg-white/10',
              'backdrop-blur-2xl',
              'p-12',
            ])}
          >
            <PortableText value={body} />
          </div>
        )}
      </article>
    </>
  );
};

export const getStaticProps: GetStaticProps<{
  preview: boolean;
}> = async ({ preview = false }) => {
  try {
    const SanityClient = Sanity.getClient(preview);
    const appConfig = await fetchAppConfig(preview);
    const data = await SanityClient.fetch(imprintQuery);

    return {
      props: {
        ...data,
        appConfig,
        preview,
      },
      revalidate: 60,
    };
  } catch (error) {
    return {
      notFound: true,
      props: null,
    };
  }
};

export default ImprintPage;
