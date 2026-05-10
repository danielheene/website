'use client'

import { usePreferences } from '@payloadcms/ui'
import type { GroupFieldLabelClientComponent } from 'payload'
import { useCallback, useEffect, useRef, useState } from 'react'

import { eventName, generateFieldId, generatePreferenceKey } from '@/fields/Address/components/_shared'
import { LocaleToggle } from '@/fields/Address/components/LocaleToggle'

type Locale = 'en' | 'de' | undefined

export const LabelComponent: GroupFieldLabelClientComponent = ({ field, path }) => {
  const fieldId = generateFieldId(path)
  const preferenceKey = generatePreferenceKey(path)

  /* Ref for accessing the field root element */
  const rootRef = useRef<HTMLElement>(null)
  /* Ref for accessing the container that contains the field elements */
  const renderFieldsRef = useRef<HTMLDivElement>(null)

  const { setPreference, getPreference } = usePreferences()
  const [locale, setLocale] = useState<Locale>()

  /**
   * bind references on the initial render
   */
  useEffect(() => {
    if (!rootRef.current) {
      rootRef.current = document.getElementById(fieldId)
    }
    if (!renderFieldsRef.current) {
      renderFieldsRef.current = document.querySelector(`#${fieldId} .render-fields`)
    }
  }, [fieldId])

  /**
   * dispatches event with locale detail on the root node to trigger re-render with the selected locale
   */
  useEffect(() => {
    if (!rootRef.current) return
    if (!renderFieldsRef.current) return

    /* lock sizes while re-rendering to avoid massive layout shifts */
    const { width, height } = renderFieldsRef.current.getBoundingClientRect()
    renderFieldsRef.current.style.width = `${width}px`
    renderFieldsRef.current.style.height = `${height}px`

    rootRef.current.dispatchEvent(new CustomEvent(eventName, { detail: { locale } }))

    /* release size lock after a short delay to enable default behavior */
    window.setTimeout(() => {
      renderFieldsRef.current.style.width = ''
      renderFieldsRef.current.style.height = ''
    }, 1000)
  }, [locale])

  /**
   * save the current selected locale to preferences to allow consistency
   */
  const updateLocale = useCallback(
    (locale: Locale) => {
      setLocale(locale)
      setPreference(preferenceKey, locale)
    },
    [preferenceKey, setPreference],
  )

  /**
   * load locale from preferences on initial render
   */
  useEffect(() => {
    getPreference<Locale>(preferenceKey).then((storedLocale) => setLocale(storedLocale ?? 'en'))
  }, [getPreference, preferenceKey])

  return (
    <div className="flex items-center justify-between gap-8 w-full">
      <h3 className={'flex items-end text-xl font-medium font-mono m-0'}>
        <span className="mr-2">{field.label as string}</span>
        {locale && <span className="opacity-60 text-sm mb-1">- {new Intl.DisplayNames(['en'], { type: 'language' }).of(locale)}</span>}
      </h3>
      <LocaleToggle currentLocale={locale} setLocale={updateLocale} />
    </div>
  )
}

export default LabelComponent
