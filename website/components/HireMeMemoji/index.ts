import dynamic from 'next/dynamic';

export const HireMeMemoji = dynamic(
  () => import('./HireMeMemoji').then((m) => m.HireMeMemoji),
  { ssr: false }
);
