import type { TextFieldServerComponent } from 'payload'

import { TextFieldWithLockAndGenerate } from '@/components/AdminPanel/TextFieldWithLockAndGenerate'
import { fetchAnthropicImageAltText } from '@/lib/fetchAnthropicImageAltText'

export const AltField: TextFieldServerComponent = ({ data: { url }, path, clientField }) => {
  const generateFunction = async () => {
    'use server'

    try {
      const imageUrl = new URL(url, process.env.SERVER_URL)
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
