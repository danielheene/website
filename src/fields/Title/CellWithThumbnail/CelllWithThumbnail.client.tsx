'use client'

import Link from 'next/link'
import type { CollectionSlug, DefaultCellComponentProps, TextFieldClient } from 'payload'
import { useListDrawerContext } from '@payloadcms/ui'

import { cn } from 'tailwind-variants'

import { Thumbnail } from '../Thumbnail'

type CellWithThumbnailClientProps = {
  thumbnailURL: string
  titleValue: string
  collectionSlug: CollectionSlug
  doc: Record<string, unknown>
  docID: string
}

export const CellWithThumbnailClient = ({
  thumbnailURL,
  titleValue,
  collectionSlug,
  docID,
  doc,
}: CellWithThumbnailClientProps) => {
  const { onSelect, isInDrawer, selectedOption } = useListDrawerContext()

  const sharedStyles = cn([
    'mx-0 my-[-10px] p-0 w-full',
    'flex items-center gap-4',
    'border-0 bg-transparent',
    'cursor-pointer',
    doc.highlighted && 'font-medium',
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
              doc,
              docID,
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
          href={`/admin/collections/${collectionSlug}/${docID}`}
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
