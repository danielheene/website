import { ResumeAboutMe } from './ResumeAboutMe'
import { ResumeContact } from './ResumeContact'
import { ResumeCustomers } from './ResumeCustomers'
import { ResumeDownloads } from './ResumeDownloads'
import { ResumeExperience } from './ResumeExperience'
import { ResumeProjects } from './ResumeProjects'
import { GlobalUserSettings } from './SettingsGlobalUser'
import { SettingsPDFBuilder } from './SettingsPDFBuilder'
import { SiteSettings } from './SiteSettings'
import { RegisteredGlobalSlug } from '@/types/globals'

export const GLOBALS = [
  ResumeAboutMe,
  ResumeContact,
  ResumeCustomers,
  ResumeDownloads,
  ResumeExperience,
  ResumeProjects,
  SiteSettings,
  SettingsPDFBuilder,
  GlobalUserSettings,
]

export const GLOBAL_SLUGS = GLOBALS.map((global) => global.slug) as RegisteredGlobalSlug[]
