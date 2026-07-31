import { type DefaultServerCellComponentProps, type TextFieldClient } from 'payload'

import { get, upperFirst } from 'lodash-es'

import { resolveRelations } from '@/lib/resolveRelation'

import CelllWithThumbnailClient from './CelllWithThumbnail.client'

type CellWithThumbnailProps = {
  thumbnailPath: string
} & DefaultServerCellComponentProps<TextFieldClient, string>

export const CellWithThumbnail = async (props: CellWithThumbnailProps) => {
  const { rowData, cellData, field, payload, collectionSlug, thumbnailPath, i18n } = props

  const thumbnailPathBase = thumbnailPath.replace(/\.(url|thumbnailURL)$/, '')
  const document = await resolveRelations(rowData)
  const thumbnailURL = get(
    document,
    `${thumbnailPathBase}.thumbnailURL`,
    get(document, `${thumbnailPathBase}.url`),
  )

  let titleValue: string | undefined
  if (cellData && typeof cellData === 'string' && cellData.length > 0) {
    titleValue = cellData
  } else if ('name' in field && typeof field.name === 'string' && field.name.length > 0) {
    titleValue = `<No ${upperFirst(field.name)}>`
  } else {
    titleValue = `<No Value>`
  }

  return (
    <CelllWithThumbnailClient
      thumbnailURL={thumbnailURL}
      titleValue={titleValue}
      doc={JSON.parse(JSON.stringify(rowData))}
      docID={rowData.id}
      collectionSlug={collectionSlug}
    />
  )
}
