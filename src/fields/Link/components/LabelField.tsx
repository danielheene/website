import type { TextFieldServerComponent, TextFieldServerProps } from 'payload'

import { fetchLinkTargetOptions } from '@/fields/Link/lib/fetchLinkTargetOptions'

import LabelFieldClient from './LabelField.client'

/**
 * Server half of the link label field.
 *
 * Preloads the same option list the target select uses — memoised on `req`,
 * so the two components share one set of queries — and hands it to the client
 * half, which resolves `{title}` from whichever option is currently selected
 * in form state.
 */
export const LabelField: TextFieldServerComponent = async (props: TextFieldServerProps) => {
  const { clientField, path, req } = props

  const optionGroups = await fetchLinkTargetOptions(req)

  return <LabelFieldClient field={clientField} optionGroups={optionGroups} path={path} />
}

export default LabelField
