'use client'

import { type JSX, type ReactNode, useMemo, useState } from 'react'
import Script from 'next/script'

import { initialUmamiContextValue, UmamiContext } from './Umami.context'
import type { UmamiContextValue, UmamiScriptOptions } from './Umami.types'

declare global {
  interface Window {
    umami: UmamiContextValue
  }
}

interface TrackingProviderProps extends UmamiScriptOptions {
  children: ReactNode
  src?: string
}

export const UmamiProvider = ({
  children,
  src = '/stats/script.js',
  websiteId,
  autoTrack = true,
  doNotTrack = false,
  tag = undefined,
  domains = undefined,
  excludeHash = false,
  excludeSearch = false,
  hostUrl = undefined,
}: TrackingProviderProps): JSX.Element => {
  const [context, setContext] = useState<UmamiContextValue>(initialUmamiContextValue)

  const renderScript = useMemo(
    () =>
      typeof src === 'string' &&
      src.length > 0 &&
      typeof websiteId === 'string' &&
      websiteId.length > 0,
    [
      src,
      websiteId,
    ],
  )

  return (
    <UmamiContext.Provider value={context}>
      {children}
      {/*{renderScript && (*/}
      {/*  <Script*/}
      {/*    src={src}*/}
      {/*    strategy="afterInteractive"*/}
      {/*    data-website-id={websiteId}*/}
      {/*    data-auto-track={autoTrack}*/}
      {/*    data-do-not-track={doNotTrack}*/}
      {/*    data-tag={tag}*/}
      {/*    data-domains={domains}*/}
      {/*    data-exclude-hash={excludeHash}*/}
      {/*    data-exclude-search={excludeSearch}*/}
      {/*    data-host-url={hostUrl}*/}
      {/*    onLoad={() => setContext({ track: window.umami.track, identify: window.umami.identify })}*/}
      {/*  />*/}
      {/*)}*/}
    </UmamiContext.Provider>
  )
}
