import { GlobalAfterChangeHook } from 'payload'

import { revalidatePDFGeneratorSettings, revalidateSiteSettings } from '@/lib/fetchers'

export const revalidateDocument: GlobalAfterChangeHook = async ({ context }) => {
  if (context.skipUpdateCachedData) return
  await revalidatePDFGeneratorSettings()
  await revalidateSiteSettings()
}
