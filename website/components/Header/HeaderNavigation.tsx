import React from 'react';
import Link from 'next/link';
import clsx, { ClassValue } from 'clsx';

interface NavigationProps {
  className?: ClassValue;
  items?: {};
}

export const HeaderNavigation = ({
  className,
}: NavigationProps): JSX.Element => {
  const mainNavigationItems = [];

  const containerClasses = React.useMemo(
    () =>
      clsx([
        'font-core-sans',
        'text-current',
        'uppercase',
        'text-3xl',
        'xl:text-4xl',
        'flex',
        'gap-8',
        'self-center',
        'transition-colors',
        'flex-row',
        className,
      ]),
    [className]
  );

  const linkClasses = clsx([
    'font-core-sans',
    'text-current',
    'text-center',
    'uppercase',
    'text-3xl',
    'xl:text-4xl',
    'transition-colors',
    'hover:no-underline',
    'p-2',
  ]);

  return (
    <nav className={containerClasses}>
      {mainNavigationItems.map(({ href, title }) => (
        <Link key={href} href={href} className={linkClasses}>
          {title}
        </Link>
      ))}
    </nav>
  );
};
