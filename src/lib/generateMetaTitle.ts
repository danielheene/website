'use server'

import { camelCase, kebabCase, snakeCase, startCase, upperFirst } from 'lodash-es'
import pupa from 'pupa'

import { fetchSiteSettings } from '@/lib/fetchers'

export const generateMetaTitle = async (title: string) => {
  // uncached on purpose: this runs in Payload field hooks (document save),
  // which may execute outside a Next request context (scripts, jobs queue)
  // where 'use cache' functions like fetchSiteSettingsCached throw
  const {
    general: { titleTemplate, siteName, siteURL },
  } = await fetchSiteSettings()

  const filters = {
    trim: (value: string) => value.trim(),
    camelCase: (value: string) => camelCase(value),
    pascalCase: (value: string) => upperFirst(camelCase(value)),
    snakeCase: (value: string) => snakeCase(value),
    kebabCase: (value: string) => kebabCase(value),
    upperCase: (value: string) => value.toUpperCase(),
    lowerCase: (value: string) => value.toLowerCase(),
    upperFirst: (value: string) => upperFirst(value),
    startCase: (value: string) => startCase(value),
  }

  return pupa(
    titleTemplate,
    {
      siteName,
      siteURL,
      title,
    },
    {
      filters,
    },
  )
}
