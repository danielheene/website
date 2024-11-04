import dynamic from 'next/dynamic';

export const GradientBackground = dynamic(
  () =>
    import('./GradientBackground').then((m) => m.GradientBackground),
  { ssr: false }
);
