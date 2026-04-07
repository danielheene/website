import { GlobalSlug } from '@custom-types'
import type { UIFieldServerComponent } from 'payload'

import { SerpFieldClient } from '@/fields/Meta/SerpField/SerpField.client'
import { generateContentURL } from '@/lib/generateContentURL'

export const SerpField: UIFieldServerComponent = async ({ data, collectionSlug, payload }) => {
  const { siteName } = await payload.findGlobal({ slug: GlobalSlug.SettingsSiteMeta })
  const pageUrl = generateContentURL({ collection: collectionSlug, slug: data.slug })
  const faviconUrl = generateContentURL({ path: '/favicon.svg' })
  return <SerpFieldClient pageUrl={pageUrl} faviconUrl={faviconUrl} siteName={siteName} />
}
