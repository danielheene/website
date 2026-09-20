'use client'

import type { UIFieldClientProps } from 'payload'
import { useField } from '@payloadcms/ui'

import {
  SerpProgressBar,
  type SerpProgressBarConfig,
} from '@/fields/Meta/components/SerpProgressBar'
import '@/fields/Meta/components/SerpProgressBar.styles.css'

type FieldComponentClientProps = {
  watchPath: string
  serpConfig: SerpProgressBarConfig
} & UIFieldClientProps

export const FieldComponentClient = ({ watchPath, serpConfig }: FieldComponentClientProps) => {
  const { value } = useField<string>({
    path: watchPath,
  })

  return <SerpProgressBar value={value ?? ''} config={serpConfig} />
}

export default FieldComponentClient
