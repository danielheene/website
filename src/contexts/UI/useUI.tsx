'use client'

import { UIContext } from '@/contexts/UI/UI.context'
import { UIContextFunctions, UIContextValues } from '@/contexts/UI/UI.types'
import React from 'react'

export const useUI = () => {
  const context = React.useContext<UIContextValues & UIContextFunctions>(UIContext)
  if (context === undefined) {
    throw new Error('useUI must be used within a UIContextProvider')
  }
  return context
}
