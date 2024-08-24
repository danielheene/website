import React from 'react'
import { CustomPropertiesProvider } from './CustomProperties'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return <CustomPropertiesProvider>{children}</CustomPropertiesProvider>
}
