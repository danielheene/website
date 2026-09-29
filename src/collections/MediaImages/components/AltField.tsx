import type { TextFieldServerComponent } from 'payload'

import { TextFieldWithLockAndGenerate } from '@/components/AdminPanel/TextFieldWithLockAndGenerate'
import { fetchAnthropicImageAltText } from '@/lib/anthropic/fetchImageAltText'
import { getRuntimeConfig } from '@/lib/runtimeConfig'

export const AltField: TextFieldServerComponent = ({ data: { url }, path, clientField }) => {
  const generateFunction = async () => {
    'use server'

    try {
      const imageUrl = new URL(url, getRuntimeConfig().serverUrl)
      const imageData = await fetch(imageUrl)
        .then((res) => res.arrayBuffer())
        .then((arrayBuffer) => Buffer.from(arrayBuffer))

      return await fetchAnthropicImageAltText(imageData)
    } catch (error) {
      console.error('Error fetching image:', error)
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
