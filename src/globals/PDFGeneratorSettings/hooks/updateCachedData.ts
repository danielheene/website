'use server'

import { GlobalAfterChangeHook } from 'payload'

import { updateGlobalData } from '@/lib/fetchers/fetchGlobalData'
import { GlobalSlug } from '@/types/globals'

export const updateCachedData: GlobalAfterChangeHook = async ({ context }) => {
  if (context.skipUpdateCachedData) return
  await updateGlobalData(GlobalSlug.PDFGeneratorSettings)
}
