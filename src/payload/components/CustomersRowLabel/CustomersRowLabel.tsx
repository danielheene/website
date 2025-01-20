'use client'

import { useRowLabel } from '@payloadcms/ui'
import { CustomerEntry } from '@custom-types'

export const CustomersRowLabel = () => {
  const {
    data: { title },
  } = useRowLabel<CustomerEntry>()

  return title ? title : ''
}
