import { NavigationItem as NavigationItemType } from '@lib/types';
import Link from 'next/link';
import { memo } from 'react';
import { Typography } from '@components/Typography';
import { Icon } from '@iconify/react';

type NavigationItemProps = NavigationItemType;
export const NavigationItem = memo(
  (props: NavigationItemProps): JSX.Element => {
    const { mode, variant } = props;

    switch (variant) {
      case 'internal': {
        const { _key, url, label } = props;
        return (
          <Link key={_key} href={url}>
            <Typography variant={`button-${mode}`}>{label}</Typography>
          </Link>
        );
      }
      case 'external': {
        const { url, label, blank, forceDownload } = props;
        return (
          <Link
            href={url}
            target={blank ? '_blank' : undefined}
            rel={blank ? 'noopener noreferrer' : undefined}
            download={forceDownload}
          >
            <Typography variant={`button-${mode}`}>
              {label}
              {forceDownload && (
                <Icon icon='mdi:tray-arrow-down' className='ml-2 text-[120%]' />
              )}
            </Typography>
          </Link>
        );
      }
      case 'file': {
        const { url, label, blank, originalFilename, forceDownload } = props;
        return (
          <Link
            href={url}
            download={
              !!originalFilename && !!forceDownload
                ? originalFilename
                : !!forceDownload
            }
            target={blank ? '_blank' : undefined}
            rel={blank ? 'noopener noreferrer' : undefined}
          >
            <Typography variant={`button-${mode}`}>
              {label}
              {forceDownload && (
                <Icon icon='mdi:tray-arrow-down' className='ml-2 text-[120%]' />
              )}
            </Typography>
          </Link>
        );
      }
      default: {
        return null;
      }
    }
  }
);
