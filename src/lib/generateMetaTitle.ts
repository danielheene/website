'use server'

import { getSiteSettings } from '@/lib/getSiteSettings'
import pupa from 'pupa'
import { camelCase, upperFirst, snakeCase, kebabCase, startCase } from 'lodash-es'

export const generateMetaTitle = async (title: string) => {
  const {general: { titleTemplate, siteName, siteUrl }} =
    await getSiteSettings()

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
