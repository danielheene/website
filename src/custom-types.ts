import type {
  GlobalUserSettings,
  ResumeAboutMeGlobalData,
  ResumeContactGlobalData,
  ResumeCustomersGlobalData,
  ResumeDownloadsGlobalData,
  ResumeExperienceGlobalData,
  ResumeProjectsGlobalData,
} from '@/types/payload'

/**
 *
 * ADMIN GROUPS
 *
 */
export enum AdminGroup {
  Resume = 'resume',
  Blog = 'blog',
  Media = 'media',
  General = 'general',
  Settings = 'settings',
}

export type Skill =
  ResumeExperienceGlobalData['skillSummary'][keyof ResumeExperienceGlobalData['skillSummary']]
export type SkillSummary = Record<keyof ResumeExperienceGlobalData['skillSummary'], Skill>

export type ResumeDocumentData = {
  locale: string
  globalUserSettings: GlobalUserSettings | null
  aboutMe: ResumeAboutMeGlobalData | null
  customers: ResumeCustomersGlobalData | null
  downloads: ResumeDownloadsGlobalData | null
  experience: ResumeExperienceGlobalData | null
  projects: ResumeProjectsGlobalData | null
  contact: ResumeContactGlobalData | null
}
