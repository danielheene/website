import type { GlobalSlug as RegisteredGlobalSlug, TypedGlobal } from 'payload'

import type { ReducedToLocale } from '@/lib/i18n'

/**
 *
 * GLOBALS
 *
 */
export enum GlobalSlug {
  SettingsPageHeader = 'page-header',
  SettingsPageFooter = 'page-footer',
  SettingsPDFBuilder = 'settings-pdf-builder',
  SettingsUserConfiguration = 'settings-user-meta',
  SettingsSiteConfiguration = 'settings-site-meta',
  ResumeAboutMe = 'resume-about-me',
  ResumeCustomers = 'resume-customers',
  ResumeDownloads = 'resume-downloads',
  ResumeExperience = 'resume-experience',
  ResumeProjects = 'resume-projects',
  ResumeContact = 'resume-contact',
}

export type { GlobalSlug as RegisteredGlobalSlug } from 'payload'
export type GlobalData<T extends RegisteredGlobalSlug = RegisteredGlobalSlug> =
  ReducedToLocale<TypedGlobal[T]>
