import { Button } from '@payloadcms/ui'

import { enqueueGenerateResumeDocument } from '@/lib/actions/enqueueGenerateResumeDocument'

const GenerateButton = () => {
  const handleClick = async () => {
    'use server'

    await enqueueGenerateResumeDocument({
      forceNow: true,
    })
  }

  return (
    <Button type="button" onClick={handleClick}>
      Generate
    </Button>
  )
}

export default GenerateButton
