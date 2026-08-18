import type { TrackFunction } from '@/lib/umami/Umami.types'

export type { TrackFunction } from '@/lib/umami/Umami.types'

export type IdentifyFunction = {
  (uniqueId: string): void
  (data: Record<string, unknown>): void
  (uniqueId: string, data: Record<string, unknown>): void
}

export interface UmamiContextValue {
  track: TrackFunction
  identify: IdentifyFunction
}

export interface UmamiScriptOptions {
  websiteId: string
  /** By default, Umami will send data to wherever the script is located. You can override this to send data to another location. */
  hostUrl?: string
  /** By default, Umami tracks all pageviews and events for you automatically. You can disable this behavior and track events yourself using the tracker functions. */
  autoTrack?: boolean
  /** If you want the tracker to only run on specific domains, you can add them to your tracker script. This is a comma-delimited list of domain names. Helps if you are working in a staging/development environment. */
  domains?: string[]
  /** If you want the tracker to collect events under a specific tag. Events can be filtered in the dashboard by a specific tag. */
  tag?: string
  /** If you don't want to collect search parameters from the URL. */
  excludeSearch?: boolean
  /** If you don't want to collect the hash value from the URL. */
  excludeHash?: boolean
  /** Respect users' Do Not Track browser setting. */
  doNotTrack?: boolean
}
