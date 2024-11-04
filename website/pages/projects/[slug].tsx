import React, { useCallback, useMemo } from 'react';

import { ProjectProjectData } from '@lib/types';
import { PortableText } from '@components/PortableText';
import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Sanity, {
  projectUrlsQuery,
  projectQuery,
  fetchAppConfig,
} from '@lib/sanity';
import { Image } from '@components/Image';
import { Typography } from '@components/Typography';
import clsx from 'clsx';
import { useAppStore } from '@lib/appStore';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';
import * as Tooltip from '@radix-ui/react-tooltip';

interface Props extends ProjectProjectData {}

const ProjectPage: NextPage<Props> = (props) => {
  const router = useRouter();
  const { title, subtitle, poster, body, links = [] } = props;
  const { previousRoute } = useAppStore();

  const handleGoBackClick = useCallback(
    () => (previousRoute ? router.back() : router.push('/')),
    [router, previousRoute]
  );

  const wrapperClassNames = clsx([
    'col-span-12',
    'lg:col-start-3',
    'lg:col-span-8',
  ]);

  return (
    <>
      <article
        className={clsx([
          'container',
          'grid',
          'grid-cols-12',
          'gap-y-8 lg:gap-y-12',
        ])}
      >
        <div
          className={clsx(['col-span-12', 'lg:col-start-2', 'lg:col-span-10'])}
        >
          <Typography as='h1' variant='section-title' className='text-center'>
            {title}
          </Typography>
          <Typography as='h2' variant='section-subtitle'>
            {subtitle}
          </Typography>
        </div>
        {poster && (
          <figure
            className={clsx([
              'col-span-full',
              'aspect-w-16',
              'aspect-h-7',
              'rounded-xl',
              'overflow-hidden',
              'shadow-2xl',
            ])}
          >
            <Image image={poster} fill />
          </figure>
        )}
        <nav
          className={clsx([
            wrapperClassNames,
            'flex',
            'flex-row',
            'md:flex-row',
            'justify-between',
            'text-2xl',
          ])}
        >
          <Typography
            as='button'
            variant='button-outlined'
            onClick={handleGoBackClick}
          >
            <Icon className='text-[120%]' icon='mdi:arrow-left' />
            Go Back
          </Typography>
          <div
            className={clsx([
              'flex',
              'flex-row',
              'items-center',
              'justify-center',
              'gap-4',
            ])}
          >
            {Array.isArray(links) &&
              links.map(({ url, icon, label }) => {
                const link = useMemo(
                  () => (
                    <a
                      href={url}
                      className='text-[140%] rounded-lg p-1.5'
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      <Icon icon={icon} />
                    </a>
                  ),
                  []
                );

                return label ? (
                  <Tooltip.Root key={url} delayDuration={0}>
                    <Tooltip.Trigger asChild>{link}</Tooltip.Trigger>
                    <Tooltip.Content sideOffset={4}>
                      <span
                        className={clsx([
                          'text-sm',
                          'text-zinc-800',
                          'bg-white',
                          'rounded-md',
                          'py-1.5',
                          'px-2.5',
                          'font-medium',
                        ])}
                      >
                        {label}
                      </span>
                      <Tooltip.Arrow width={11} height={5} fill='white' />
                    </Tooltip.Content>
                  </Tooltip.Root>
                ) : (
                  <React.Fragment key={url}>{link}</React.Fragment>
                );
              })}
          </div>
        </nav>
        {body && (
          <div
            className={clsx([
              wrapperClassNames,
              'rounded-lg',
              'glass',
              'glass-light',
              'p-6',
              'md:p-8',
              'xl:p-12',
            ])}
          >
            <PortableText value={body} />
          </div>
        )}
      </article>
    </>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = await Sanity.getClient()
    .fetch(projectUrlsQuery)
    .then((projects) => projects.map((p) => p.urlPath));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps<{
  preview: boolean;
  params: { slug: string };
}> = async ({ preview = false, params }) => {
  try {
    const { slug } = params;
    const SanityClient = Sanity.getClient(preview);
    const appConfig = await fetchAppConfig(preview);
    const data = await SanityClient.fetch(projectQuery, { slug });

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

export default ProjectPage;
