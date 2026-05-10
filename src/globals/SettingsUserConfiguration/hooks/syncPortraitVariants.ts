'use server'

import type { FieldHook } from 'payload'

import type { UserConfigurationData } from '@/types/payload'

export const syncPortraitVariants: FieldHook<
  UserConfigurationData,
  UserConfigurationData['portrait']
> = async ({ data, value, siblingData, req }) => {
  console.log('Portrait image updated:', value)
  console.log('Data:', data)
  console.log('Sibling Data:', siblingData)
  return value
}
