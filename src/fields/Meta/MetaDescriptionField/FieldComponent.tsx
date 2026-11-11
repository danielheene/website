import type { TextFieldServerComponent } from 'payload'

import { requireSession } from '@/lib/actions/requireSession'
import { fetchAnthropicMetaDescription } from '@/lib/anthropic/fetchMetaDescription'

import { FieldComponentClient } from './FieldComponent.client'

export const FieldComponent: TextFieldServerComponent = async ({
  collectionSlug,
  data,
  path,
  clientField,
}) => {
  const generateFunction = async () => {
    'use server'

    try {
      await requireSession()

      // An empty result leaves the field as it is.
      return (
        (await fetchAnthropicMetaDescription({
          collection: collectionSlug,
          data,
        })) ?? ''
      )
    } catch (error) {
      console.error('Error generating meta description:', error)

      return ''
    }
  }

  return (
    <FieldComponentClient
      field={clientField}
      path={path}
      hasGenerate={true}
      hasLock={true}
      generateFunction={generateFunction}
    />
  )
}

export default FieldComponent
