import { get } from 'lodash-es'

import type { UIFieldServerComponent, UIFieldServerProps } from 'payload'

import { generateContentURL } from '@/lib/generateContentURL'
import { GlobalSlug } from '@/types/globals'

import { FieldComponentClient } from './FieldComponent.client'
import { getSiteSettings } from '@/lib/getSiteSettings'

type FieldComponentProps = {
  slugPath: string
} & UIFieldServerProps

export const FieldComponent: UIFieldServerComponent = async ({
  data,
  collectionSlug,
  payload,
  clientField,
  path,
  slugPath,
}: FieldComponentProps) => {
  const { general: {siteName} } = await getSiteSettings()
  const pageUrl = generateContentURL({
    collection: collectionSlug,
    slug: get(data, slugPath),
  })
  const faviconUrl = generateContentURL({
    path: '/favicon.svg',
  })
  return (
    <FieldComponentClient
      field={clientField}
      path={path}
      pageUrl={pageUrl}
      faviconUrl={faviconUrl}
      siteName={siteName}
    />
  )
}

export default FieldComponent
