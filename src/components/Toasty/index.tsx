import React, { Suspense } from 'react'

const LazyToasty = React.lazy(() =>
  import('./Toasty').then((module) => ({
    default: module.Toasty,
  })),
)

export const Toasty = () => (
  <Suspense fallback={null}>
    <LazyToasty />
  </Suspense>
)
