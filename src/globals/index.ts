import { ResumeDownloads } from '@/globals/ResumeDownloads'
import { SettingsPageHeader } from '@/globals/SettingsPageHeader'
import { SettingsSiteConfiguration } from '@/globals/SettingsSiteConfiguration'
import type { RegisteredGlobalSlug } from '@/types/globals'

import { ResumeAboutMe } from './ResumeAboutMe'
import { ResumeContact } from './ResumeContact'
import { ResumeCustomers } from './ResumeCustomers'
import { ResumeExperience } from './ResumeExperience'
import { ResumeProjects } from './ResumeProjects'
import { SettingsPageFooter } from './SettingsPageFooter'
import { SettingsUserConfiguration } from './SettingsUserConfiguration'

export const GLOBALS = [
  ResumeAboutMe,
  ResumeContact,
  ResumeCustomers,
  ResumeDownloads,
  ResumeExperience,
  ResumeProjects,
  SettingsPageHeader,
  SettingsPageFooter,
  SettingsSiteConfiguration,
  SettingsUserConfiguration,
]

export const GLOBAL_SLUGS = GLOBALS.map(
  (global) => global.slug,
) as RegisteredGlobalSlug[]
