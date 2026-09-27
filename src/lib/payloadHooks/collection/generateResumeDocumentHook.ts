import { CollectionAfterOperationHook } from 'payload'

import { enqueueGenerateResumeDocument } from '@/lib/actions/enqueueGenerateResumeDocument'

export const generateResumeDocumentHook: CollectionAfterOperationHook = async ({
  operation,
  req,
}): Promise<void> => {
  if (req.context?.skipGenerateResumeDocumentHook) return

  if (
    [
      'create',
      'update',
      'updateByID',
      'delete',
      'deleteByID',
    ].includes(operation)
  ) {
    await enqueueGenerateResumeDocument()
  }
}
