'use client'

import { useListDrawerContext } from '@payloadcms/ui'
import Link from 'next/link'
import type { DefaultCellComponentProps, TextFieldClient } from 'payload'

import { cn } from '@/lib/cn'

import { Thumbnail } from '../Thumbnail'

type CellWithThumbnailClientProps = {
  thumbnailURL: string
  titleValue: string
} & DefaultCellComponentProps<TextFieldClient>

export const CellWithThumbnailClient = ({
  thumbnailURL,
  titleValue,
  collectionSlug,
  cellData,
  rowData,
  columnIndex,
}: CellWithThumbnailClientProps) => {
  const { onSelect, isInDrawer, selectedOption } = useListDrawerContext()


  const sharedStyles = cn([
    'mx-0 my-[-10px] p-0 w-full',
    'flex items-center gap-4',
    'border-0 bg-transparent',
    'cursor-pointer',
    rowData.highlighted && 'font-medium',
  ])

  const innerContent = (
    <>
      <Thumbnail thumbnailURL={thumbnailURL} />
      <span>{titleValue}</span>
    </>
  )

  return (
    <>
      {isInDrawer && onSelect ? (
        <button
          type="button"
          onClick={() =>
            onSelect({
              collectionSlug,
              doc: rowData,
              docID: rowData.id,
            })
          }
          className={cn([
            sharedStyles,
          ])}
        >
          {innerContent}
        </button>
      ) : (
        <Link
          href={`/admin/collections/${collectionSlug}/${rowData.id}`}
          className={cn([
            sharedStyles,
          ])}
        >
          {innerContent}
        </Link>
      )}
    </>
  )
}

export default CellWithThumbnailClient
