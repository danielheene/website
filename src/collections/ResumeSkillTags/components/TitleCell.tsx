import type { DefaultServerCellComponentProps, TextFieldClient } from 'payload'

import { upperFirst } from 'lodash-es'

import TitleCellClient from './TitleCell.client'

type TitleCellProps = DefaultServerCellComponentProps<TextFieldClient, string>

export const TitleCell = ({ rowData, cellData, field, collectionSlug }: TitleCellProps) => {
  let titleValue: string
  if (cellData && typeof cellData === 'string' && cellData.length > 0) {
    titleValue = cellData
  } else if ('name' in field && typeof field.name === 'string' && field.name.length > 0) {
    titleValue = `<No ${upperFirst(field.name)}>`
  } else {
    titleValue = `<No Value>`
  }

  return (
    <TitleCellClient
      icon={typeof rowData.icon === 'string' ? rowData.icon : undefined}
      titleValue={titleValue}
      doc={JSON.parse(JSON.stringify(rowData))}
      docID={rowData.id}
      collectionSlug={collectionSlug}
    />
  )
}

export default TitleCell
