'use client'

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { deburr, kebabCase } from 'lodash-es'
import { useDebounceCallback } from '@/utilities/useDebounceCallback'

export interface ContextType {
  customProperties: Record<string, string>
  setCustomProperty: (name: string, value: string) => void
}

const initialContext: ContextType = {
  customProperties: {},
  setCustomProperty: () => void 0,
}

const CustomPropertiesContext = createContext(initialContext)

export const CustomPropertiesProvider = ({ children }: { children: React.ReactNode }) => {
  const [propertiesState, setPropertiesState] = useState<Record<string, string>>({})

  const setCustomProperty = useDebounceCallback((propertyName: string, value: string) => {
    setPropertiesState({ ...propertiesState, [propertyName]: value })
  }, 200)

  useEffect(() => {
    Object.entries(propertiesState).forEach(([name, value]) => {
      if (typeof document === 'undefined') return
      document.documentElement.style.setProperty(name, value)
    })
  }, [propertiesState])

  const value = useMemo(
    () => ({
      customProperties: propertiesState,
      setCustomProperty: setCustomProperty,
    }),
    [propertiesState, setCustomProperty],
  )

  return (
    <CustomPropertiesContext.Provider value={value}>{children}</CustomPropertiesContext.Provider>
  )
}

export const useSetCustomProperty = (name: string, value: string): void => {
  const { customProperties, setCustomProperty } = useContext(CustomPropertiesContext)
  const propertyName = `--${kebabCase(deburr(name.replaceAll(/^(--)/g, '')))}`
  console.log(customProperties[propertyName], value)
  if (customProperties[propertyName] !== value) setCustomProperty(propertyName, value)
}
