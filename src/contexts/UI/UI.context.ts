'use client'

import { createContext } from 'react'

import type { UIContextFunctions, UIContextValues } from '@/contexts/UI/UI.types'

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
