import React from 'react';

import type { NavigationItem } from '@typings/navigation';
import { NavigationItemType } from '@typings/navigation';

export const menuItems: Array<Array<NavigationItem>> = [
  [
    {
      type: NavigationItemType.LINK,
      icon: 'feather:home',
      text: 'Home',
      href: '/',
    },
    {
      type: NavigationItemType.LINK,
      icon: 'feather:clock',
      text: 'Timeline',
      href: '/timeline',
    },
  ],
  [
    {
      type: NavigationItemType.LINK,
      icon: 'simple-icons:github',
      text: 'GitHub',
      href: 'https://github.com/danielheene',
      external: true,
    },
    {
      type: NavigationItemType.LINK,
      icon: 'simple-icons:instagram',
      text: 'Instagram',
      href: 'https://www.instagram.com/daniel.heene',
      external: true,
    },
    {
      type: NavigationItemType.LINK,
      icon: 'simple-icons:linkedin',
      text: 'LinkedIn',
      href: 'https://de.linkedin.com/in/danielheene',
      external: true,
    },
    {
      type: NavigationItemType.LINK,
      icon: 'simple-icons:xing',
      text: 'Xing',
      href: 'https://www.xing.com/profile/Daniel_Heene',
      external: true,
    },
    {
      type: NavigationItemType.LINK,
      external: true,
      href: 'mailto:daniel@heene.io',
      icon: 'feather:mail',
      text: 'Mail',
    },
  ],
  [
    {
      type: NavigationItemType.LINK,
      icon: 'feather:file-text',
      text: 'Imprint',
      href: '/imprint',
    },
  ],
];
