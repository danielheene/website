export interface TrackFunction {
  (): void
  (eventName: string): void
  (data: Record<string, unknown>): void
  (eventName: string, data: Record<string, unknown>): void
  (fn: (data: Record<string, unknown>) => Record<string, unknown>): void
}

export type IdentifyFunction = {
  (uniqueId: string): void
  (data: Record<string, unknown>): void
  (uniqueId: string, data: Record<string, unknown>): void
}

export type BeforeSendFunction = {
  (type?: string, payload?: Record<string, unknown>): Record<string, unknown> | false | null | undefined
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
  /** Allows you to specify a function that will be called before data is sent. You can then inspect and modify the payload or cancel the sending entirely. The function will take two parameters, type and payload. To continue with sending, you return a payload object. To cancel the sending, return a false-y value. */
  beforeSend?: BeforeSendFunction
}
