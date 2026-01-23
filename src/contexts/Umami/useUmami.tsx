'use client'

import { useContext } from 'react'
import { UmamiContext } from './Umami.context'

import { UmamiContextValue } from './Umami.types'

export const useUmami = (): UmamiContextValue => {
  const context = useContext(UmamiContext)
  if (!context) throw new Error('Missing UmamiProvider in tree')
  return context
}
