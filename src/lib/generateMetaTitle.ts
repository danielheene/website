'use server'

import { camelCase, kebabCase, snakeCase, startCase, upperFirst } from 'lodash-es'
import pupa from 'pupa'

import { fetchSiteSettingsCached } from '@/lib/fetchers'

export const generateMetaTitle = async (title: string) => {
  const {
    general: { titleTemplate, siteName, siteURL },
  } = await fetchSiteSettingsCached()

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
