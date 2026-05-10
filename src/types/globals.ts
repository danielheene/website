import type { GlobalSlug as RegisteredGlobalSlug, TypedGlobal } from 'payload'

/**
 *
 * GLOBALS
 *
 */
export enum GlobalSlug {
  SettingsPageHeader = 'page-header',
  SettingsPageFooter = 'page-footer',
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
  TypedGlobal[T]
