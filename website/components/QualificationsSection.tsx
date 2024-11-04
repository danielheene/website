import { useRef } from 'react';
import clsx from 'clsx';

import { Card } from '@components/Card';
import { Section, SectionHeader } from '@components/Section';
import { QualificationItemData, QualificationsSectionData } from '@lib/types';
import { motion, useInView } from 'framer-motion';
import { staggerTransition } from '@lib/transitions';

interface QualificationEntryProps extends QualificationItemData {
  index: number;
}

const QualificationEntry = ({
  index,
  title,
  employer,
  location,
  start,
  end,
  body,
}: QualificationEntryProps): JSX.Element => {
  const isOdd = !(index % 2);
  const ref = useRef<HTMLDivElement>();
  const isInView = useInView(ref, {
    once: true,
    amount: 'some',
    margin: '-35%',
  });

  return (
    <motion.div
      ref={ref}
      className={clsx(
        'relative',
        'lg:w-1/2',
        isOdd ? 'lg:mr-auto' : 'lg:ml-auto',
        'before:content[" "]',
        'before:block',
        'before:w-4',
        'before:h-4',
        'before:rounded-full',
        'before:bg-vibrant-october-silence',
        'before:absolute',
        'before:top-0',
        isOdd ? 'before:left-full' : 'before:left-0',
        'before:-translate-x-1/2'
      )}
      initial='hidden'
      animate={isInView ? 'visible' : 'hidden'}
      variants={staggerTransition.item}
    >
      <div
        className={clsx(
          [
            'lg:max-w-[460px]',
            'xl:max-w-[540px]',
            'w-full',
            'ml-auto',
            'pl-8',
            'sm:pl-11',
            'lg:pl-0',
            'lg:pr-0',
            'relative',
          ],
          isOdd ? ['lg:text-right', 'lg:mr-5'] : ['lg:ml-5'],
          'text-white'
        )}
      >
        <Card variant='light'>
          <h3
            className={clsx(
              'font-syne',
              'font-bold',
              'text-3xl',
              'mb-1',
              'text-transparent',
              'bg-clip-text',
              'bg-headline'
            )}
          >
            {title}
          </h3>
          <p className='font-syne font-semibold text-gray-200 mb-3'>
            {employer} | {location}
          </p>
          <span
            className={clsx([
              'inline-flex',
              'items-center',
              'justify-center',
              'py-1.5',
              'px-2.5',
              'rounded-full',
              'bg-headline',
              'text-white',
              'text-xs',
              'font-bold',
              'mb-5',
            ])}
          >
            {end ? `${start} - ${end}` : `since ${start}`}
          </span>
          <p className='font-medium text-base text-white'>{body}</p>
        </Card>
      </div>
    </motion.div>
  );
};

type QualificationsSectionProps = QualificationsSectionData;

export const QualificationsSection = (
  props: QualificationsSectionProps
): JSX.Element => {
  const { entries, header } = props;

  return (
    <Section>
      <SectionHeader {...header} />

      <div
        className={clsx(
          'relative',
          'flex',
          'flex-col',
          'gap-12',
          'py-12',
          'before:content[" "]',
          'before:absolute',
          'before:top-0',
          'before:block',
          'before:left-2',
          'before:lg:left-1/2',
          'before:w-[1px]',
          'before:h-full',
          'before:bg-white/80',
          'before:-translate-x-1/2'
        )}
      >
        {entries.map((resume, index) => (
          <QualificationEntry key={resume._key} index={index} {...resume} />
        ))}
      </div>
    </Section>
  );
};
