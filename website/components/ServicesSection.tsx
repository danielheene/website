import { Icon } from '@iconify/react';

import { Section, SectionHeader } from '@components/Section';
import { Typography } from '@components/Typography';
import { ServiceItemData, ServicesSectionData } from '@lib/types';
import clsx from 'clsx';
import { PortableText } from '@components/PortableText';

const ServiceItem = ({
  name,
  icon,
  body,
}: Omit<ServiceItemData, '_key'>): JSX.Element => {
  return (
    <div
      className={clsx([
        'flex',
        'flex-col',
        'flex-grow-0',
        'flex-shrink-0',
        'content-start',
        'basis-1',
        'min-w-[300px]',
        'max-w-[350px]',
        'm-12',
        'gap-12',
        'text-center',
        'text-white',
        'bg-transparent',
      ])}
    >
      <div className='mx-auto text-6xl flex-shrink-0 flex-grow-0'>{icon && <Icon icon={icon} />}</div>
      <Typography variant='section-subtitle'>{name}</Typography>
      <PortableText value={body} />
    </div>
  );
};

export const ServicesSection = (props: ServicesSectionData): JSX.Element => {
  const { header, entries } = props;

  return (
    <Section>
      <SectionHeader {...header} />

      <div
        className={clsx([
          'flex',
          'flex-column',
          'md:flex-row',
          'flex-wrap',
          'justify-around',
          '-mt-12',
          '-mb-12',
          'overflow-hidden',
        ])}
      >
        {entries.map(({ _key, ...itemProps }) => (
          <ServiceItem key={_key} {...itemProps} />
        ))}
      </div>
    </Section>
  );
};
