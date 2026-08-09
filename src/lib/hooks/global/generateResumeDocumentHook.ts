import { GlobalAfterChangeHook } from 'payload'

import { enqueueGenerateResumeDocument } from '@/lib/actions/enqueueGenerateResumeDocument'

export const generateResumeDocumentHook: GlobalAfterChangeHook = async ({ req }): Promise<void> => {
  if (req.context?.skipGenerateResumeDocumentHook) return

  await enqueueGenerateResumeDocument()
}
