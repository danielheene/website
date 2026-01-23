'use client'

import { UIContextFunctions, UIContextValues } from '@/contexts/UI/UI.types'
import { createContext } from 'react'

export const initialUIContextValues: UIContextValues = {
  headerHeight: null,
  footerHeight: null,
}

export const initialUIContextFunctions: UIContextFunctions = {
  setHeaderHeight: () => {},
  setFooterHeight: () => {},
}

export const UIContext = createContext<UIContextValues & UIContextFunctions>({
  ...initialUIContextValues,
  ...initialUIContextFunctions,
})
