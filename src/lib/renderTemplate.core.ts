import config from '@payload-config'
import { getPayload, type PayloadRequest } from 'payload'

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

import { extractErrorMessage } from '@/lib/extractErrorMessage'
import { fetchGlobalUserSettings, fetchSiteSettings } from '@/lib/fetchers'
import { Locale } from '@/lib/i18n'
import { nanoid } from '@/lib/nanoid'

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

export type RenderTemplateCoreArgs = RenderTemplateArgs & {
  /**
   * When supplied, the request's own payload instance is reused and the
   * global settings are memoised on `req.context` for its lifetime. A page
   * rendering N links would otherwise cost 2N global reads.
   */
  req?: PayloadRequest
}

type TemplateGlobals = {
  site: Awaited<ReturnType<typeof fetchSiteSettings>>
  user: Awaited<ReturnType<typeof fetchGlobalUserSettings>>
}

const GLOBALS_CONTEXT_KEY = 'renderTemplateGlobals'

type TemplateFilter = (value: string) => string

/**
 * Filters are registered lowercase, but the admin help panel documents (and
 * editors therefore write) camelCase names such as `kebabCase`. pupa looks
 * filters up case-sensitively, so both spellings have to resolve.
 */
const TEMPLATE_FILTERS: Record<string, TemplateFilter> = {
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
}

/**
 * Case-insensitive fallback index. Only consulted after an exact lookup misses,
 * so the date filters — registered as `MM`, `dd` and `yyyy` — keep resolving to
 * themselves instead of being folded into a lowercase key that does not exist.
 */
const TEMPLATE_FILTER_ALIASES = new Map<string, TemplateFilter>(
  Object.entries(TEMPLATE_FILTERS).map(([name, filter]) => [
    name.toLowerCase(),
    filter,
  ]),
)

const loadTemplateGlobals = async (
  locale: Locale,
  req?: PayloadRequest,
): Promise<TemplateGlobals> => {
  const cacheKey = `${GLOBALS_CONTEXT_KEY}:${locale}`
  const cached = req?.context?.[cacheKey] as Promise<TemplateGlobals> | undefined

  if (cached) return cached

  const pending = (async () => {
    const [site, user] = await Promise.all([
      fetchSiteSettings(locale),
      fetchGlobalUserSettings(locale),
    ])

    return {
      site,
      user,
    }
  })()

  if (req?.context) {
    req.context[cacheKey] = pending
    // A rejected fetch must not leave a permanently poisoned cache entry:
    // evict it so the next caller retries instead of re-throwing forever.
    pending.catch(() => {
      if (req.context?.[cacheKey] === pending) delete req.context[cacheKey]
    })
  }

  return pending
}

export const renderTemplateCore = async ({
  template,
  data = {},
  locale = 'en',
  req,
}: RenderTemplateCoreArgs): Promise<RenderTemplateError | RenderTemplateResult> => {
  const payload =
    req?.payload ??
    (await getPayload({
      config,
    }))

  const {
    getAPIURL,
    getAdminURL,
    config: { serverURL },
  } = payload

  const {
    site: {
      general: { siteName, siteURL, siteHost },
    },
    user: { firstName, lastName, name, jobTitle, birthDate, email, gender, pronouns },
  } = await loadTemplateGlobals(locale, req)

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
        filters: new Proxy(TEMPLATE_FILTERS, {
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

            /**
             * Exact match first: `MM`, `dd` and `yyyy` are registered under those
             * exact keys and would not survive a blanket lowercase normalisation.
             */
            const exactMatch = Reflect.get(target, prop, receiver)
            if (exactMatch !== undefined) return exactMatch

            /**
             * Fallback so the camelCase names the admin help panel documents
             * (`kebabCase`, `upperFirst`, …) resolve to their lowercase filter.
             */
            if (typeof prop === 'string') return TEMPLATE_FILTER_ALIASES.get(prop.toLowerCase())

            return undefined
          },
        }),
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
