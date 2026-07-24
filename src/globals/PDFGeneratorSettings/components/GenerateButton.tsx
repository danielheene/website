import { Button } from '@payloadcms/ui'

import { enqueueGenerateResumeDocument } from '@/lib/actions/enqueueGenerateResumeDocument'

const GenerateButton = () => {
  return (
    <Button type="button" onClick={enqueueGenerateResumeDocument}>
      Generate
    </Button>
  )
}

export default GenerateButton
