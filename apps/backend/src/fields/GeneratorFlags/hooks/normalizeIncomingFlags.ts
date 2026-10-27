import { FieldHook } from 'payload'

import { isArray, isString } from 'lodash-es'

/**
 * Normalizes the flag list to unique, plain flag names.
 *
 * Leading `+`/`-` are stripped rather than rejected: the field previously used
 * them as add/remove operators, so documents and callers written against that
 * shape still supply them. Stripping keeps those writes working and converging
 * on the stored form instead of creating a second spelling of every flag.
 */
export const normalizeIncomingFlags: FieldHook = async ({
  value,
}: {
  value?: string[]
}): Promise<string[]> => {
  if (!isArray(value)) return []

  return value
    .filter(isString)
    .map((flag) => flag.replace(/^[+-]/, '').trim())
    .filter((flag) => flag !== '')
    .filter((flag, index, array) => array.indexOf(flag) === index)
}
