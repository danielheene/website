import type { TextFieldServerComponent } from 'payload'

import { TextFieldWithLockAndGenerate } from '@/components/AdminPanel/TextFieldWithLockAndGenerate'
import { requireSession } from '@/lib/actions/requireSession'
import { fetchAnthropicImageAltText } from '@/lib/anthropic/fetchImageAltText'
import { resolveOwnMediaUrl } from '@/lib/resolveOwnMediaUrl'

export const AltField: TextFieldServerComponent = ({ data: { url }, path, clientField }) => {
  const generateFunction = async () => {
    'use server'

    try {
      await requireSession()

      const imageData = await fetch(resolveOwnMediaUrl(url))
        .then((res) => res.arrayBuffer())
        .then((arrayBuffer) => Buffer.from(arrayBuffer))

      return await fetchAnthropicImageAltText(imageData)
    } catch (error) {
      console.error('Error generating alt text:', error)

      return ''
    }
  }

  return (
    <TextFieldWithLockAndGenerate
      field={clientField}
      path={path}
      hasGenerate={true}
      hasLock={true}
      generateFunction={generateFunction}
    />
  )
}
