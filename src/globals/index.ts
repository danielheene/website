import type { RegisteredGlobalSlug } from '@custom-types'

import { ResumeDownloads } from '@/globals/ResumeDownloads'
import { SettingsFooterNavigation } from '@/globals/SettingsFooterNavigation'
import { SettingsHeaderNavigation } from '@/globals/SettingsHeaderNavigation'
import { SettingsSiteMeta } from '@/globals/SettingsSiteMeta'
import { SettingsUserMeta } from '@/globals/SettingsUserMeta'

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
  SettingsHeaderNavigation,
  SettingsFooterNavigation,
  SettingsSiteMeta,
  SettingsUserMeta,
]

export const GLOBAL_SLUGS = GLOBALS.map((global) => global.slug) as RegisteredGlobalSlug[]
