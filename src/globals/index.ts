import { ResumeDownloads } from '@/globals/ResumeDownloads'
import { SettingsHeader } from '@/globals/SettingsHeader'
import { SettingsMeta } from '@/globals/SettingsMeta'
import { RegisteredGlobalSlug } from '@custom-types'
import { ResumeAboutMe } from './ResumeAboutMe'
import { ResumeContact } from './ResumeContact'
import { ResumeCustomers } from './ResumeCustomers'
import { ResumeExperience } from './ResumeExperience'
import { ResumeProjects } from './ResumeProjects'

export const GLOBALS = [
  ResumeAboutMe,
  ResumeContact,
  ResumeCustomers,
  ResumeDownloads,
  ResumeExperience,
  ResumeProjects,
  SettingsHeader,
  SettingsMeta,
]

export const GLOBAL_SLUGS = GLOBALS.map((global) => global.slug) as RegisteredGlobalSlug[]
