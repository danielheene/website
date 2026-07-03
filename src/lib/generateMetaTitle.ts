'use server'

import { getSiteConfigurationData } from '@/lib/getSiteConfigurationData'
import pupa from 'pupa'
import { camelCase, upperFirst, snakeCase, kebabCase, startCase } from 'lodash-es'

export const generateMetaTitle = async (title: string) => {
  const { titleTemplate, siteName, siteUrl } =
    await getSiteConfigurationData()

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

  return pupa(titleTemplate, {
    siteName,
    siteUrl,
    title,
  }, {
    filters,
  })
}
