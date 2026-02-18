'use client'

import { useDebouncedCallback } from '@payloadcms/ui'
import { kebabCase } from 'lodash-es'
import { type JSX, useEffect, useMemo, useReducer } from 'react'
import { useDebounceCallback } from 'usehooks-ts'

import { initialUIContextValues, UIContext } from '@/contexts/UI/UI.context'
import { type Action, ActionType, type UIContextValues, type UIProviderProps } from '@/contexts/UI/UI.types'

function reducer(state: UIContextValues, action: Action) {
  switch (action.type) {
    case ActionType.SetHeaderHeight: {
      return { ...state, headerHeight: action.payload }
    }
    case ActionType.SetFooterHeight: {
      return { ...state, footerHeight: action.payload }
    }
    default: {
      // @ts-expect-error
      throw new Error(`Unhandled action type: ${action.type}`)
    }
  }
}

const DEBOUNCE_TIME = 200

export const UIProvider = ({ children }: UIProviderProps): JSX.Element => {
  const [state, dispatch] = useReducer(reducer, initialUIContextValues)

  /**
   * Set CSS custom properties for header and footer heights
   */
  useEffect(() => {
    Object.entries(state).forEach(([key, value]) => {
      const property = `--${kebabCase(key)}`

      if (value) {
        document.documentElement.style.setProperty(property, `${value}px`)
      } else {
        document.documentElement.style.removeProperty(property)
      }
    })
  }, [state])

  /**
   * Debounce header height updates to prevent unnecessary re-renders
   */
  const setHeaderHeight = useDebounceCallback(
    (height: number) => dispatch({ type: ActionType.SetHeaderHeight, payload: height }),
    DEBOUNCE_TIME,
  )

  /**
   * Debounce footer height updates to prevent unnecessary re-renders
   */
  const setFooterHeight = useDebouncedCallback(
    (height: number) => dispatch({ type: ActionType.SetFooterHeight, payload: height }),
    DEBOUNCE_TIME,
  )

  /**
   * Memoize the value object to prevent unnecessary re-renders
   */
  const value = useMemo(
    () => ({
      ...state,
      setHeaderHeight,
      setFooterHeight,
    }),
    [state, setHeaderHeight, setFooterHeight],
  )

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>
}
