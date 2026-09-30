'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import type { CollectionSlug } from 'payload'
import { useListDrawerContext } from '@payloadcms/ui'

import { cn } from 'tailwind-variants'

import { Icon } from '@/components/Icon'

type TitleCellClientProps = {
  icon?: string
  titleValue: ReactNode
  collectionSlug: CollectionSlug
  doc: Record<string, unknown>
  docID: string
}

export const TitleCellClient = ({
  icon,
  titleValue,
  collectionSlug,
  docID,
  doc,
}: TitleCellClientProps) => {
  const { onSelect, isInDrawer } = useListDrawerContext()

  const sharedStyles = cn([
    'mx-0 my-[-10px] p-0 w-full',
    'flex items-center gap-2',
    'border-0 bg-transparent',
    'cursor-pointer',
  ])

  const innerContent = (
    <>
      {icon && <Icon name={icon} className="size-4 shrink-0" />}
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
          className={sharedStyles}
        >
          {innerContent}
        </button>
      ) : (
        <Link href={`/admin/collections/${collectionSlug}/${docID}`} className={sharedStyles}>
          {innerContent}
        </Link>
      )}
    </>
  )
}

export default TitleCellClient
