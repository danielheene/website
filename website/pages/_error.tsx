import { Icon } from '@iconify/react';

import Link from 'next/link';
import { Typography } from '@components/Typography';

export default function Error() {
  return (
    <div className='flex-grow flex flex-col justify-center max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8'>
      <div className='flex flex-shrink-0 justify-center'>
        <Icon
          icon='feather:alert-triangle'
          className='h-12 text-primary-500 w-auto'
        />
      </div>
      <div className='py-4 text-center'>
        <h1 className='mt-2 text-4xl font-extrabold text-white tracking-tight sm:text-5xl'>
          Whoops!
        </h1>
        <p className='mt-8 text-sm font-medium text-gray-400'>
          Looks like you took a wrong turn.
          <br />
          The page you're looking for couldn't be found.
        </p>
        <div className='mt-6 flex justify-center items-center space-x-4'>
          <Link href='/'>
            <Typography variant='button-primary'>
              Home
              <Icon icon='mdi:home-outline' />
            </Typography>
          </Link>
        </div>
      </div>
    </div>
  );
}
