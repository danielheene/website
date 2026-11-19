import type { FieldHookArgs } from 'payload'

import type { GlobalUserSettings } from '@/types/payload'

/**
 * Normalizes a field value before validation by converting nullish input to an empty string
 * and removing leading and trailing whitespace.
 */
export const trimValueBeforeValidate = ({
  value,
}: FieldHookArgs<GlobalUserSettings, string, GlobalUserSettings>) => (value ?? '').trim()
