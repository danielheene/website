import { Section, SectionHeader } from '@components/Section';
import { Image } from '@components/Image';
import clsx, { ClassValue } from 'clsx';
import { memo, useRef } from 'react';
import { ProjectTeaserData, ProjectTeaserSectionData } from '@lib/types';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { staggerTransition } from '@lib/transitions';

interface ProjectItemProps extends ProjectTeaserData {
  className?: ClassValue;
}

export const ProjectItem = memo(
  ({
    poster,
    category,
    title,
    urlPath,
    excerpt,
    className,
  }: ProjectItemProps): JSX.Element => {
    const MotionLink = motion(Link);
    return (
      <MotionLink
        href={urlPath}
        variants={staggerTransition.item}
        className={clsx([
          'relative',
          'overflow-hidden',
          'group',
          'cursor-pointer',
          'rounded-lg',
          className,
        ])}
      >
        <Image
          image={poster}
          className={clsx([
            'transition-all',
            'duration-500',
            'group-hover:scale-105',
            'rounded-lg',
          ])}
        />
        <div>
          <header
            className={clsx([
              'absolute',
              'left-0',
              'top-0',
              'right-0',
              'gap-2',
              'p-4',
              'md:p-8',
              'rounded-lg',
              'bg-gradient-to-b',
              'from-black/30',
              'to-transparent',
              'drop-shadow-card-header',
            ])}
          >
            <p
              className={clsx([
                'block',
                'h-5',
                'font-extrabold',
                'font-jetbrains-mono',
                'text-sm',
                'text-orange-400',
                'uppercase',
                'tracking-tight',
              ])}
            >
              {category}
            </p>
            <p
              className={clsx([
                'text-2xl',
                'md:text-3xl',
                'font-bold',
                'text-white',
                'font-inter',
              ])}
            >
              {title}
            </p>
          </header>

          {excerpt !== null && `${excerpt}`.trim() !== '' && (
            <div
              className={clsx([
                'absolute',
                'p-12',
                'md:p-20',
                'pt-24',
                '-left-12',
                '-right-12',
                '-bottom-12',
                'bg-gradient-to-b',
                'from-transparent',
                'via-zinc-900/70',
                'to-zinc-900/95',
                'opacity-0',
                'transition-all',
                'group-hover:opacity-100',
                'duration-500',
                'scale-90',
                'group-hover:scale-100',
                'origin-bottom',
                'rounded-lg',
              ])}
            >
              <div
                className={clsx([
                  'translate-y-8',
                  'transform',
                  'opacity-0',
                  'transition-all',
                  'group-hover:translate-y-0',
                  'group-hover:opacity-100',
                ])}
              >
                <p
                  className={clsx([
                    'text-sm',
                    'md:text-xl',
                    'font-medium',
                    'text-white',
                    'tracking-tighter',
                    'break-words',
                    'hyphens',
                    'line-clamp-2',
                  ])}
                >
                  {excerpt}
                </p>
              </div>
            </div>
          )}
        </div>
      </MotionLink>
    );
  }
);

export const ProjectTeaserSection = (
  props: ProjectTeaserSectionData
): JSX.Element => {
  const { header, projectOne, projectTwo, projectThree, projectFour } = props;
  const containerRef = useRef<HTMLDivElement>();
  const isInView = useInView(containerRef, { margin: '15%', once: true });

  return (
    <Section>
      <SectionHeader {...header} />
      <motion.div
        ref={containerRef}
        className='grid grid-cols-3 gap-8 lg:mx-8 xl:mx-16'
        initial='hidden'
        animate={isInView ? 'visible' : 'hidden'}
        variants={staggerTransition.container}
      >
        {projectOne && (
          <ProjectItem
            {...projectOne}
            className='col-span-3 md:col-span-2 aspect-w-3 md:aspect-w-2 aspect-h-1'
          />
        )}
        {projectTwo && (
          <ProjectItem
            {...projectTwo}
            className='col-span-3 md:col-span-1 aspect-w-3 md:aspect-w-1 aspect-h-1'
          />
        )}
        {projectThree && (
          <ProjectItem
            {...projectThree}
            className='col-span-3 md:col-span-1 aspect-w-3 md:aspect-w-1 aspect-h-1'
          />
        )}
        {projectFour && (
          <ProjectItem
            {...projectFour}
            className='col-span-3 md:col-span-2 aspect-w-3 md:aspect-w-2 aspect-h-1'
          />
        )}
      </motion.div>
    </Section>
  );
};
