import dynamic from 'next/dynamic';

export const Toasty = dynamic(
  () => import('./Toasty').then((m) => m.Toasty),
  { ssr: false }
);
