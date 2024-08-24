'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import React, { JSX, useCallback, useEffect, useState } from 'react'

import type { Theme } from '../shared'
import { themeLocalStorageKey } from '../shared'

import { useTheme } from '..'

export const ThemeSelector = (): JSX.Element => {
  const { setTheme } = useTheme()
  const [value, setValue] = useState('')

  const onThemeChange = useCallback(
    (themeToSet: Theme & 'auto') => {
      if (themeToSet === 'auto') {
        setTheme(null)
        setValue('auto')
      } else {
        setTheme(themeToSet)
        setValue(themeToSet)
      }
    },
    [setTheme, setValue],
  )

  useEffect(() => {
    const preference = window.localStorage.getItem(themeLocalStorageKey)
    setValue(preference ?? 'auto')
  }, [])

  return (
    <Select onValueChange={onThemeChange} value={value}>
      <SelectTrigger className="w-auto bg-transparent gap-2 pl-0 md:pl-3 border-none">
        <SelectValue placeholder="Theme" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="auto">Auto</SelectItem>
        <SelectItem value="light">Light</SelectItem>
        <SelectItem value="dark">Dark</SelectItem>
      </SelectContent>
    </Select>
  )
}
