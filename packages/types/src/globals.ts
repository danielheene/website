import type { GlobalSlug as RegisteredGlobalSlug, TypedGlobal } from 'payload'

import type { BilingualLocale, ReducedToBilingualLanguage } from './reduceDataToBilingualLanguage'
import type { ResolvedRelations } from './resolvedRelations'

export const GlobalSlug = {
  SiteSettings: 'settings-site',
  PDFGeneratorSettings: 'settings-pdf-builder',
  GlobalUserSettings: 'settings-global-user',
  ResumeDownloads: 'resume-downloads',
  ResumeContact: 'resume-contact',
} as const

export type GlobalSlug = typeof GlobalSlug

export type GlobalSlugKey = keyof GlobalSlug & string

export type GlobalSlugValue = string & GlobalSlug[GlobalSlugKey]

export type { GlobalSlug as RegisteredGlobalSlug } from 'payload'

export type GlobalData<
  T extends RegisteredGlobalSlug = RegisteredGlobalSlug,
  L extends BilingualLocale = 'en',
> = ReducedToBilingualLanguage<ResolvedRelations<TypedGlobal[T]>, L>
