'use client'

import React from 'react'

import type { UmamiContextValue } from './Umami.types'

export const initialUmamiContextValue: UmamiContextValue = {
  track: () => undefined,
  identify: () => undefined,
}

export const UmamiContext = React.createContext<UmamiContextValue>(initialUmamiContextValue)
