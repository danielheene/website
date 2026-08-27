import { RegisteredGlobalSlug } from '@/types/globals'

import { PDFGeneratorSettings } from './PDFGeneratorSettings'
import { GlobalUserSettings } from './SettingsGlobalUser'
import { SiteSettings } from './SiteSettings'

export const GLOBALS = [
  SiteSettings,
  PDFGeneratorSettings,
  GlobalUserSettings,
]

export const GLOBAL_SLUGS = GLOBALS.map((global) => global.slug) as RegisteredGlobalSlug[]
