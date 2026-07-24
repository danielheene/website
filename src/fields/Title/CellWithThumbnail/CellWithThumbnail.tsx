'use server'

import { type DefaultServerCellComponentProps, type TextFieldClient } from 'payload'

import { get, upperFirst } from 'lodash-es'

import { isMediaImage } from '@/lib/typeGuards'

import CelllWithThumbnailClient from './CelllWithThumbnail.client'

type CellWithThumbnailProps = {
  thumbnailPath: string
} & DefaultServerCellComponentProps<TextFieldClient>

export const CellWithThumbnail = async (props: CellWithThumbnailProps) => {
  const { rowData, cellData, field, payload, collectionSlug, thumbnailPath } = props

  const thumbnailPathBase = thumbnailPath.replace(/(\.url)$/, '').replace(/(\.thumbnailURL)$/, '')

  const document = await payload.findByID({
    collection: collectionSlug,
    id: rowData.id,
  })

  let thumbnailURL: string | undefined
  const media = get(document, thumbnailPathBase)
  if (media && isMediaImage(media)) {
    thumbnailURL = media.thumbnailURL || media.url
  }

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
      collectionSlug={collectionSlug}
      rowData={JSON.parse(JSON.stringify(rowData))}
    />
  )
}
