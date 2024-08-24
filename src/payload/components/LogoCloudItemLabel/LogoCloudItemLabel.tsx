'use client'

import { RowLabelProps, usePayloadAPI, useRowLabel } from '@payloadcms/ui'
import { FC } from 'react'

const MediaFilename = ({ id }: { id: string | number }) => {
  const [
    {
      data: { alt },
      isError,
      isLoading,
    },
  ] = usePayloadAPI(`/api/media/${id}`)

  return !isError && !isLoading && <span>{alt}</span>
}

export const LogoCloudItemLabel: FC<RowLabelProps> = () => {
  const {
    data: { logo },
  } = useRowLabel<{ logo: number }>()

  return !!logo && <MediaFilename id={logo} />
}
