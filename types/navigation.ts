import type { ReactNode } from 'react';

interface NavigationItemBase {
  endIcon?: string | ReactNode;
  icon: string | ReactNode;
  text: string;
  onClick?: () => void;
  href?: string;
}

export enum NavigationItemType {
  ACTION = 'action',
  LINK = 'link',
}

export type NavigationItem =
  | ({
      type: NavigationItemType.ACTION;
    } & Omit<NavigationItemBase, 'href'>)
  | ({
      external?: boolean;
      type: NavigationItemType.LINK;
    } & NavigationItemBase);

export type NavigationItems = Array<Array<NavigationItem>>;
