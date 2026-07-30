import type { UIFieldServerComponent, UIFieldServerProps } from 'payload'

import { get } from 'lodash-es'

import { fetchSiteSettings } from '@/lib/fetchers'
import { generateContentURL } from '@/lib/generateContentURL'

import { FieldComponentClient } from './FieldComponent.client'

type FieldComponentProps = {
  slugPath: string
} & UIFieldServerProps

export const FieldComponent: UIFieldServerComponent = async ({
  data,
  collectionSlug,
  clientField,
  path,
  slugPath,
}: FieldComponentProps) => {
  const {
    general: { siteName },
  } = await fetchSiteSettings()
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
