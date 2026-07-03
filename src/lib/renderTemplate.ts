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

/**
 * Renders a template string by replacing placeholders with provided data values.
 * Supports various string transformation filters including case conversions, trimming,
 * and custom length slicing. Uses the pupa template engine with a proxy-based filter
 * system that provides both predefined and dynamically generated filters.
 *
 * @param {string} template - The template string containing placeholders to be replaced
 * @param {Record<string, string>} [data] - Optional key-value pairs for placeholder replacement
 * @returns {string} The rendered template with all placeholders replaced and filters applied
 *
 * Available filters:
 * - trim: Removes whitespace from both ends of a string
 * - trimStart: Removes whitespace from the start of a string
 * - trimEnd: Removes whitespace from the end of a string
 * - camelCase: Converts string to camelCase
 * - snakeCase: Converts string to snake_case
 * - kebabCase: Converts string to kebab-case
 * - startCase: Converts string to Start Case
 * - upperCase: Converts string to UPPER CASE
 * - upperFirst: Capitalizes the first character
 * - lowerCase: Converts string to lower case
 * - lowerFirst: Lowercases the first character
 * - toLower: Converts entire string to lowercase
 * - toUpper: Converts entire string to uppercase
 * - slugify: Converts string to URL-friendly slug
 * - pascalCase: Converts string to PascalCase
 * - lenN: Custom dynamic filter that slices string to N characters (e.g., len10 for first 10 chars)
 * - truncN: Custom dynamic filter that truncates string to N characters with ellipsis (e.g., trunc10 for first 7 chars)
 *
 */
export const renderTemplate = (template: string, data?: Record<string, string>) => {
  return pupa(template, data || {}, {
    filters: new Proxy(
      {
        trim,
        trimStart,
        trimEnd,
        camelCase,
        snakeCase,
        kebabCase,
        startCase,
        upperCase,
        upperFirst,
        lowerCase,
        lowerFirst,
        toLower,
        toUpper,
        slugify,
        pascalCase: (value: string) => upperFirst(camelCase(value)),
        MM: (value: string) => format(value, 'MM'),
        dd: (value: string) => format(value, 'dd'),
        yyyy: (value: string) => format(value, 'yyyy'),
      },
      {
        get(target, prop, receiver) {
          console.dir(`Accessing filter: ${String(prop)}`)
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
  })
}
