import { forwardRef, memo, Ref, useMemo } from 'react';

import { Card } from '@components/Card';
import { Marquee } from '@components/Marquee';
import { Section, SectionHeader } from '@components/Section';
import { CustomerItemData, CustomersSectionData } from '@lib/types';
import { Image } from '@components/Image';

const CustomersItem = memo((props: CustomerItemData): JSX.Element => {
  const { image } = props;

  return (
    <Card variant='light' className='w-full flex justify-center items-center'>
      <div className='w-full aspect-w-16 aspect-h-6'>
        <Image
          image={image}
          fill={false}
          className='w-full h-full object-contain px-5'
        />
      </div>
    </Card>
  );
});
export const CustomersSection = memo(
  ({ header, entries }: CustomersSectionData): JSX.Element => {
    const items = useMemo(
      () => entries.map((e, i) => <CustomersItem key={i} {...e} />),
      [entries]
    );

    return (
      <Section fullWidth>
        <SectionHeader {...header} />
        <Marquee>{items}</Marquee>
        <Marquee reverse>{items}</Marquee>
      </Section>
    );
  }
);
