import { TextFieldServerComponent, TextFieldServerProps } from 'payload'

import { z } from 'zod'

import { Locale } from '@/lib/i18n'

import {
  TemplateFieldAnnotation,
  TemplateFieldAnnotationFunction,
  TemplateFieldData,
  TemplateFieldDataFunction,
} from '../types'
import FieldComponentClient from './FieldComponent.client'

interface FieldComponentProps extends TextFieldServerProps {
  renderLocale?: Locale[]
  customData?: TemplateFieldData | TemplateFieldDataFunction
  customAnnotation?: TemplateFieldAnnotation | TemplateFieldAnnotationFunction
}

export const FieldComponent: TextFieldServerComponent = async (props: FieldComponentProps) => {
  const {
    path,
    clientField,
    renderLocale = [
      'en',
    ],
    data,
    siblingData,
    user,
    payload,
    customAnnotation: customAnnotationFromProps,
    customData: customDataFromProps,
  } = props

  const customAnnotation = ((
    anntotation?: TemplateFieldAnnotation | TemplateFieldAnnotationFunction,
  ) => {
    if (typeof anntotation === 'function') {
      return [
        anntotation({
          siblingData,
          data,
          user,
          payload,
        }),
      ]
    }
    if (typeof anntotation === 'object') {
      return [
        anntotation,
      ]
    }
    return []
  })(customAnnotationFromProps)

  const customData = ((data?: TemplateFieldData | TemplateFieldDataFunction) => {
    const nextData =
      typeof data === 'function'
        ? data({
            siblingData,
            data,
            user,
            payload,
          })
        : data
    const parsed = z.record(z.string(), z.string()).safeParse(nextData)
    if (!parsed.success) {
      console.error(z.prettifyError(parsed.error))
      return {}
    }
    return parsed.data
  })(customDataFromProps)

  return (
    <FieldComponentClient
      field={clientField}
      path={path}
      renderLocale={renderLocale}
      data={{
        ...customData,
      }}
      annotations={[
        {
          label: 'Global Data',
          entries: {
            '{siteName}': 'Name of the Website',
            '{siteHost}': 'Host of the Website',
            '{siteURL}': 'URL of the Website',
            '{adminURL}': 'URL of the Admin Dashboard',
            '{apiURL}': 'API URL of the website',
          },
        },
        {
          label: 'User Data',
          entries: {
            '{firstName}': 'First name of the global configured user',
            '{lastName}': 'Last name of the global configured user',
            '{name}': 'Joined firstName and lastName of the global configured user',
            '{jobTitle}': 'Job title of the global user configuration',
            '{birthDate}': 'Birth date of the global user configuration',
            '{email}': 'Email of the global user configuration',
            '{gender}': 'Gender of the global user configuration',
            '{pronouns}': 'Pronouns of the global user configuration',
          },
        },
        ...customAnnotation,
        {
          label: 'Filters',
          entries: {
            trim: 'Removes whitespace from both ends of a string',
            trimStart: 'Removes whitespace from the start of a string',
            trimEnd: 'Removes whitespace from the end of a string',
            camelCase: 'Converts string to camelCase',
            snakeCase: 'Converts string to snake_case',
            kebabCase: 'Converts string to kebab-case',
            startCase: 'Converts string to Start Case',
            upperCase: 'Converts string to UPPER CASE',
            upperFirst: 'Capitalizes the first character',
            lowerCase: 'Converts string to lower case',
            lowerFirst: 'Lowercases the first character',
            toLower: 'Converts entire string to lowercase',
            toUpper: 'Converts entire string to uppercase',
            slugify: 'Converts string to URL-friendly slug',
            pascalCase: 'Converts string to PascalCase',
            MM: 'Formats a date value as a two-digit month (e.g., 08)',
            dd: 'Formats a date value as a two-digit day of month (e.g., 13)',
            yyyy: 'Formats a date value as a four-digit year (e.g., 2026)',
            lenN: 'Custom dynamic filter that slices string to N characters (e.g., len10 for first 10 chars)',
            truncN:
              'Custom dynamic filter that truncates string to N characters with ellipsis (e.g., trunc10 for first 7 chars)',
          },
        },
      ]}
    />
  )
}

export default FieldComponent
