'use server'

import config from '@payload-config'
import { getPayload } from 'payload'

import slugify from '@sindresorhus/slugify'
import { format } from 'date-fns'
import {
  camelCase,
  kebabCase,
  lowerCase,
  lowerFirst,
  snakeCase,
  startCase,
  toLower,
  toUpper,
  trim,
  trimEnd,
  trimStart,
  upperCase,
  upperFirst,
} from 'lodash-es'
import pupa from 'pupa'

import { extractErrorMessage } from '@repo/utils/extractErrorMessage'
import { fetchGlobalUserSettings, fetchSiteSettings } from '@/lib/fetchers'
import { Locale } from '@/lib/i18n'
import { nanoid } from '@repo/utils/nanoid'

export type RenderTemplateArgs = {
  template: string
  data?: Record<string, string>
  locale?: Locale
}

export type RenderTemplateResult = {
  result: string
  error: null
}

export type RenderTemplateError = {
  error: string
  result: null
}

export const renderTemplate = async ({
  template,
  data = {},
  locale = 'en',
}: RenderTemplateArgs): Promise<RenderTemplateResult | RenderTemplateError> => {
  const payload = await getPayload({
    config,
  })

  const {
    getAPIURL,
    getAdminURL,
    config: { serverURL },
  } = payload

  const {
    general: { siteName, siteURL, siteHost },
  } = await fetchSiteSettings(locale)

  const { firstName, lastName, name, jobTitle, birthDate, email, gender, pronouns } =
    await fetchGlobalUserSettings(locale)

  try {
    const result = pupa(
      template,

      new Proxy(
        {
          date: format(new Date(), 'yyyy-MM-dd'),
          locale,
          serverURL,
          siteName,
          siteURL,
          siteHost,
          aminURL: getAdminURL(),
          apiURL: getAPIURL(),

          firstName,
          lastName,
          name,
          jobTitle,
          birthDate,
          email,
          gender,
          pronouns,

          ...data,
        },
        {
          get(target, prop, receiver) {
            if (typeof prop === 'string' && /^nanoid[0-9]*$/.test(prop)) {
              const maxLength = parseInt(prop.replace('nanoid', ''), 10) || 7
              return data?.nanoid?.substring(0, maxLength) || nanoid(maxLength)
            }

            return Reflect.get(target, prop, receiver)
          },
        },
      ),

      {
        filters: new Proxy(
          {
            trim: trim,
            trimstart: trimStart,
            trimend: trimEnd,
            camelcase: camelCase,
            snakecase: snakeCase,
            kebabcase: kebabCase,
            startcase: startCase,
            uppercase: upperCase,
            upperfirst: upperFirst,
            lowercase: lowerCase,
            lowerfirst: lowerFirst,
            tolower: toLower,
            toupper: toUpper,
            slugify: slugify,
            pascalcase: (value: string) => upperFirst(camelCase(value)),
            MM: (value: string) => format(value, 'MM'),
            dd: (value: string) => format(value, 'dd'),
            yyyy: (value: string) => format(value, 'yyyy'),
          },
          {
            get(target, prop, receiver) {
              if (typeof prop === 'string' && prop.startsWith('Mar')) return () => 'Markus'
              /**
               * Custom filter to slice a string to a specified length
               * e.g. { id | len10 } will slice the value of id to the first 10 characters
               */
              if (typeof prop === 'string' && /^len[0-9]+$/.test(prop)) {
                const maxLength = parseInt(prop.replace('len', ''), 10)
                return (value: string) => value.slice(0, maxLength)
              }

              /**
               * Custom filter to truncate a string to a specified length with ellipsis
               * e.g. { string | trunc10 } will truncate the value of string to the first 7 characters and append '...'
               */
              if (typeof prop === 'string' && /^trunc[0-9]+$/.test(prop)) {
                const maxLength = parseInt(prop.replace('trunc', ''), 10)
                return (value: string) => {
                  if (value.length <= maxLength) return value
                  return `${value.slice(0, maxLength - 3)}...`
                }
              }

              return Reflect.get(target, prop, receiver)
            },
          },
        ),
      },
    )

    return {
      result: result,
      error: null,
    }
  } catch (error) {
    return {
      result: null,
      error: extractErrorMessage(error),
    }
  }
}
