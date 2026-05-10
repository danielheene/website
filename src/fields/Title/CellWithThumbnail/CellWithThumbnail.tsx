import { get, upperFirst } from 'lodash-es'
import {
  createClientFields,
  type DefaultServerCellComponentProps,
  type TextFieldClient,
} from 'payload'

import { isMediaImage } from '@/lib/typeGuards'

import CelllWithThumbnailClient from './CelllWithThumbnail.client'

type CellWithThumbnailProps = {
  thumbnailPath: string
} & DefaultServerCellComponentProps<TextFieldClient>

export const CellWithThumbnail = async (props: CellWithThumbnailProps) => {
  const {
    rowData,
    cellData,
    field,
    customCellProps,
    payload,
    collectionSlug,
    thumbnailPath,
    // viewType,
    link,
    linkURL,
    viewType,
    i18n,
    onClick,
    columnIndex,
    className,
  } = props

  console.dirxml(props)

  const [clientField] = createClientFields({
    fields: [
      field,
    ],
    disableAddingID: true,
    defaultIDType: 'text',
    i18n,
    importMap: payload.importMap,
  }) as TextFieldClient[]

  const thumbnailPathBase = thumbnailPath
    .replace(/(\.url)$/, '')
    .replace(/(\.thumbnailURL)$/, '')

  const document = await payload.findByID({
    collection: collectionSlug,
    id: rowData.id,
  })

  let thumbnailURL: string | undefined
  const media = get(document, thumbnailPathBase)
  if (media && isMediaImage(media)) {
    thumbnailURL = media.thumbnailURL || media.url
  }

  console.log('thumbnailURL', thumbnailURL)

  let titleValue: string | undefined
  if (cellData && typeof cellData === 'string' && cellData.length > 0) {
    titleValue = cellData
  } else if (
    'name' in field &&
    typeof field.name === 'string' &&
    field.name.length > 0
  ) {
    titleValue = `<No ${upperFirst(field.name)}>`
  } else {
    titleValue = `<No Value>`
  }

  return (
    <CelllWithThumbnailClient
      thumbnailURL={thumbnailURL}
      titleValue={titleValue}
      cellData={cellData}
      collectionSlug={collectionSlug}
      field={clientField}
      rowData={rowData}
      onClick={onClick}
    />
  )
}
