import type { TextFieldServerComponent } from 'payload'

import { TextFieldWithLockAndGenerate } from '@/components/AdminPanel/TextFieldWithLockAndGenerate'
import { generateContentURL } from '@/lib/generateContentURL'
import { generateMetaDescription } from '@/lib/generateMetaDescription'

export const DescriptionField: TextFieldServerComponent = ({ collectionSlug, data, value, field, path, clientField }) => {
  const geneateFunction = async () => {
    'use server'
    const pageUrl = generateContentURL({ collection: collectionSlug, slug: data.slug })
    return await generateMetaDescription(pageUrl)
  }

  return (
    <TextFieldWithLockAndGenerate field={clientField} path={path} hasGenerate={true} hasLock={true} generateFunction={geneateFunction} />
  )
}
