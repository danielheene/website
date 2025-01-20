'use client'

import { createContext, JSX, ReactNode, useCallback, useContext, useMemo, useState } from 'react'

export type Anchor = {
  id: string
  title: string
  active: boolean
}

export interface SectionNavigationContextData {
  anchors: Anchor[]
  registerAnchor: (anchor: Omit<Anchor, 'active'> & Partial<Pick<Anchor, 'active'>>) => void
  setActiveAnchor: (id: string) => void
}

export interface SectionNavigationProviderProps {
  children: ReactNode
}

export const initialContextData: SectionNavigationContextData = {
  anchors: [],
  registerAnchor: () => undefined,
  setActiveAnchor: () => undefined,
}

export const SectionNavigationContext = createContext(initialContextData)

export const SectionNavigationProvider = ({
  children,
}: SectionNavigationProviderProps): JSX.Element => {
  const [anchors, setAnchors] = useState<Anchor[]>([])

  const registerAnchor = useCallback(
    (anchor: Omit<Anchor, 'active'> & Partial<Pick<Anchor, 'active'>>) => {
      setAnchors((prevAnchors: Anchor[]) =>
        prevAnchors
          .concat({
            ...anchor,
            active: false,
          })
          .filter((value, index, self) => index === self.findIndex((t) => t.id === value.id)),
      )
    },
    [],
  )

  const setActiveAnchor = useCallback((id: string): void => {
    setAnchors((prevAnchors) =>
      prevAnchors.map((anchor) => ({ ...anchor, active: anchor.id === id })),
    )
  }, [])

  const value = useMemo(
    () => ({
      anchors,
      setActiveAnchor,
      registerAnchor,
    }),
    [anchors, registerAnchor, setActiveAnchor],
  )

  return (
    <SectionNavigationContext.Provider value={value}>{children}</SectionNavigationContext.Provider>
  )
}

export const useSectionNavigation = () => {
  const context = useContext<SectionNavigationContextData>(SectionNavigationContext)
  if (context === undefined) {
    throw new Error('useSectionNavigation must be used within a SectionNavigationProvider')
  }
  return context
}
