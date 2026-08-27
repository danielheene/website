import type { TextFieldServerComponent, TextFieldServerProps } from 'payload'

import { get } from 'lodash-es'

import { fetchAnthropicMetaDescription } from '@/lib/fetchAnthropicMetaDescription'
import { generateContentURL } from '@/lib/generateContentURL'

import { FieldComponentClient } from './FieldComponent.client'

type DescriptionFieldProps = {
  slugPath: string
} & TextFieldServerProps

export const FieldComponent: TextFieldServerComponent = async ({
  collectionSlug,
  data,
  path,
  clientField,
  slugPath,
}: DescriptionFieldProps) => {
  const generateFunction = async () => {
    'use server'
    const pageUrl = generateContentURL({
      collection: collectionSlug,
      slug: get(data, slugPath),
    })
    return await fetchAnthropicMetaDescription(pageUrl)
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
