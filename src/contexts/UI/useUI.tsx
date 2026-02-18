'use client'

import React from 'react'

import { UIContext } from '@/contexts/UI/UI.context'
import type { UIContextFunctions, UIContextValues } from '@/contexts/UI/UI.types'

export const useUI = () => {
  const context = React.useContext<UIContextValues & UIContextFunctions>(UIContext)
  if (context === undefined) {
    throw new Error('useUI must be used within a UIContextProvider')
  }
  return context
}
