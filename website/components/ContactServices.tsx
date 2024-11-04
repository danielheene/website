import clsx, { ClassValue } from 'clsx';
import { ContactProvider, ContactItem } from '@lib/types';
import { resolveContactItem } from '@lib/utils';
import { Icon } from '@iconify/react';
import React, { useMemo } from 'react';

interface ContactModuleProps {
  entries: Record<string, string>;
  selection?: string[];
  className?: ClassValue;
  small?: boolean;
}

export const ContactModule = ({
  entries,
  selection = [
    'github',
    'linkedin',
    'xing',
    'instagram',
    'discord',
    'whatsapp',
    'mail',
    'phone',
  ],
  small,
  className,
}: ContactModuleProps): JSX.Element => {
  /**
   *
   */
  const services = useMemo(
    () =>
      Object.entries(entries)
        .filter(([key, _]) => selection.includes(key))
        .sort((a, b) => {
          const aPos = selection.indexOf(a[0]);
          const bPos = selection.indexOf(b[0]);
          return aPos > bPos ? +1 : -1;
        }),
    [entries]
  );

  return (
    <div
      className={clsx([
        'flex',
        'flex-row',
        'justify-center',
        'py-2',
        'gap-3',
        className,
      ])}
    >
      {services.map(([key, value]) => {
        const { urlPrefix, icon }: ContactItem = resolveContactItem(
          key as ContactProvider
        );

        return (
          <a
            key={key}
            href={`${urlPrefix as string}${value}`}
            target='_blank'
            rel='noopener noreferrer'
            className={clsx([
              'block',
              'relative',
              'text-white',
              'transition-all',
              'hover:scale-125',
              'active:outline-0',
              'duration-100',
              'rounded-lg',
              small ? ['text-2xl', 'p-2'] : ['text-3xl', 'p-1.5', 'sm:p-2.5'],
            ])}
          >
            <Icon icon={icon} className='fill-white' />
          </a>
        );
      })}
    </div>
  );
};
