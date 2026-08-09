// import 'server-only'

import { GlobalAfterChangeHook } from 'payload'

import { revalidatePDFGeneratorSettings } from '@/lib/fetchers'

export const revalidateDocument: GlobalAfterChangeHook = async ({ context }) => {
  if (context.skipUpdateCachedData) return
  await revalidatePDFGeneratorSettings()
}
