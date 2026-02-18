import { CollectionSlug } from '@custom-types'
import { get } from 'lodash-es'
import Image from 'next/image'
import Link from 'next/link'
import type { DefaultServerCellComponentProps } from 'payload'
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
  payload,
  collectionSlug,
  thumbnailPath,
}: DefaultServerCellComponentProps & { thumbnailPath: string }) => {
  let src = null

  try {
    const { thumbnailURL, url } = await payload.findByID({
      collection: CollectionSlug.MediaImages,
      id: get(rowData, thumbnailPath),
    })
    src = thumbnailURL || url
  } catch (_) {
    /* no media found */
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {src ? <Image src={src} alt="" width={40} height={40} style={style} /> : <div style={style} />}
      <Link href={`/admin/collections/${collectionSlug}/${rowData.id}`}>{cellData}</Link>
    </div>
  )
}
