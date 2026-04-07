import type { MediaImage } from '@payload-types'
import { get, upperFirst } from 'lodash-es'
import Image from 'next/image'
import Link from 'next/link'
import type { DefaultServerCellComponentProps, TextFieldClient } from 'payload'
import type { CSSProperties } from 'react'

const style: CSSProperties = {
  width: '40px',
  height: '40px',
  margin: '0 var(--base) 0 0',
  objectFit: 'contain',
  borderRadius: 'var(--style-radius-s)',
}

export const CellWithThumbnail = async ({
  rowData,
  cellData,
  field,
  payload,
  collectionSlug,
  thumbnailPath,
  onClick,
}: DefaultServerCellComponentProps<TextFieldClient> & { thumbnailPath: string }) => {
  let thumbnailSrc = null

  try {
    const document = await payload.findByID({
      collection: collectionSlug,
      id: rowData.id,
    })
    const { thumbnailURL, url } = get(document, thumbnailPath.replace(/(\.thumbnailURL)$/, '')) as MediaImage
    thumbnailSrc = thumbnailURL || url
  } catch (_) {
    /* no media found */
  }

  const handleClick = async () => {
    'use server'
    typeof onClick === 'function' && onClick({ collectionSlug, rowData, cellData })
  }

  const innerElements = (
    <>
      {thumbnailSrc ? <Image src={thumbnailSrc} style={style} width={40} height={40} alt="" /> : <div style={style} />}
      <span>{cellData || `<No ${upperFirst('name' in field ? field.name : 'Value')}>`}</span>
    </>
  )

  return typeof onClick === 'function' ? (
    <button style={{ display: 'flex', alignItems: 'center' }} type="button" onClick={handleClick}>
      {innerElements}
    </button>
  ) : (
    <Link style={{ display: 'flex', alignItems: 'center' }} href={`/admin/collections/${collectionSlug}/${rowData.id}`}>
      {innerElements}
    </Link>
  )
}
