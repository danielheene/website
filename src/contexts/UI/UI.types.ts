import type { ReactNode } from 'react'

export enum ActionType {
  SetHeaderHeight = 'SET_HEADER_HEIGHT',
  SetFooterHeight = 'SET_FOOTER_HEIGHT',
}

export type Action = { type: ActionType.SetHeaderHeight; payload: number } | { type: ActionType.SetFooterHeight; payload: number }

export interface UIContextValues {
  headerHeight: number | null
  footerHeight: number | null
}

export interface UIContextFunctions {
  setHeaderHeight: (height: number) => void
  setFooterHeight: (height: number) => void
}

export interface UIProviderProps {
  children: ReactNode
}
