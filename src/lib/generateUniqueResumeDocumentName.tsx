import { formatDate } from 'date-fns'
import { upperFirst } from 'lodash-es'
import { customAlphabet } from 'nanoid'

/**
 * Generates a unique ID only using uppercase letters and numbers to avoid any potential conflicts with existing filenames.
 */
const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 10)

type Params = {
  authorName: string,
  locale: string,
}

/**
 * Generates a unique document name for a resume PDF based on the author's name, locale, current date, and a unique ID.
 * @example 'JohnDoe_Resume_EN_20240101_[J3W9HRTZ4T]'
 * @param authorName
 * @param locale
 */
export const generateUniqueResumeDocumentName = ({ authorName, locale }: Params) =>
  [
    authorName
      .split(' ')
      .map((name) => upperFirst(name))
      .join(''),
    'Resume',
    `${locale.toUpperCase()}`,
    `${formatDate(new Date(), 'yyyyMMdd')}`,
    `[${nanoid()}].pdf`,
  ]
    .filter(Boolean)
    .join('_')
    .replace(/_+/g, '_')
