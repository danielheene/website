import type { GlobalSlug as RegisteredGlobalSlug, TypedGlobal } from 'payload'

import type { Locale, ReducedToLocale } from '@/lib/i18n'
import { ResolvedRelations } from '@/lib/resolveRelation'

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
  L extends Locale = 'en',
> = ReducedToLocale<ResolvedRelations<TypedGlobal[T]>, L>
