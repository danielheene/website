import type { UIFieldServerComponent, UIFieldServerProps } from 'payload'

import type { SerpProgressBarConfig } from '@/fields/Meta/components/SerpProgressBar'

import { FieldComponentClient } from './FieldComponent.client'

type FieldComponentProps = {
  watchPath: string
  serpConfig: SerpProgressBarConfig
} & UIFieldServerProps

export const FieldComponent: UIFieldServerComponent = ({
  watchPath,
  serpConfig,
  clientField,
  path,
}: FieldComponentProps) => {
  return (
    <FieldComponentClient
      field={clientField}
      path={path}
      watchPath={watchPath}
      serpConfig={serpConfig}
    />
  )
}

export default FieldComponent
