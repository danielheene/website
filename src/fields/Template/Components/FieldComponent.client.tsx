'use client'

import { ChangeEvent, JSX, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { TextFieldClientProps } from 'payload'
import { getTranslation } from '@payloadcms/translations'
import {
  FieldDescription,
  FieldError,
  fieldBaseClass,
  RenderCustomComponent,
  useField,
  useTranslation,
} from '@payloadcms/ui'
import { mergeFieldStyles } from '@payloadcms/ui/shared'

import * as Collapsible from '@radix-ui/react-collapsible'

import { Icon } from '@/components/Icon'
import { TemplateFieldAnnotation, TemplateFieldData } from '@/fields/Template/types'
import { cn } from '@/lib/cn'
import { Locale } from '@/lib/i18n'
import { renderTemplate } from '@/lib/renderTemplate'

type FieldComponentClientProps = TextFieldClientProps & {
  annotations?: TemplateFieldAnnotation[]
  data?: TemplateFieldData
  renderLocale?: Locale[]
}

export const FieldComponentClient = ({
  field,
  path,
  annotations,
  data = {},
  renderLocale = [
    'en',
  ],
  validate,
}: FieldComponentClientProps): JSX.Element => {
  const { label: labelFromProps, admin } = field
  const {
    description: descriptionFromProps,
    placeholder: placeholderFromProps,
    readOnly,
    className,
  } = admin

  const inputRef = useRef<HTMLInputElement>(null)
  const prevTemplateDataRef = useRef<string>('')
  const [renderedResults, setRenderedResults] = useState<string[]>([])
  const [renderedErrors, setRenderedErrors] = useState<string[]>([])
  const [collapsibleOpen, setCollapsibleOpen] = useState<boolean>(false)

  const {
    value: template,
    setValue: setTemplate,
    formProcessing,
    formInitializing,
    showError,
    errorMessage,
    customComponents: {
      Description: DescriptionComponent,
      Label: LabelComponent,
      Error: ErrorComponent,
    },
  } = useField<string>({
    path,
    validate,
  })

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement, HTMLInputElement>) => {
      event.preventDefault()
      if (template !== event.target.value) {
        setTemplate(event.target.value)
      }
    },
    [
      setTemplate,
      template,
    ],
  )

  useEffect(() => {
    const currentData = JSON.stringify({
      template,
      data,
    })

    if (prevTemplateDataRef.current !== currentData) {
      renderLocale
        .reduce(
          async (prev, curr) => {
            const next = await prev
            next.results = next?.results || []
            next.errors = next?.errors || []

            const { result, error } = await renderTemplate({
              template,
              data,
              locale: curr,
            })

            next.results.push(result)
            next.errors.push(error)

            return next
          },
          {} as Promise<{
            results: string[]
            errors: string[]
          }>,
        )
        .then(({ results, errors }) => {
          setRenderedResults(results)
          setRenderedErrors(errors)
          prevTemplateDataRef.current = currentData
        })
    }
  }, [
    template,
    data,
    renderLocale,
  ])

  const styles = useMemo(
    () => mergeFieldStyles(field),
    [
      field,
    ],
  )

  const { i18n } = useTranslation()
  const label = getTranslation(labelFromProps, i18n)
  const placeholder = getTranslation(placeholderFromProps, i18n)

  const hasRenderErrors = renderedErrors.some((error) => error !== null)
  const renderError = renderedErrors.find((error) => error !== null)

  return (
    <div
      className={cn(
        fieldBaseClass,
        'text',
        'template',
        className,
        (showError || hasRenderErrors) && 'error',
        readOnly && 'read-only',
      )}
      style={styles}
    >
      <header
        className={cn([
          `${fieldBaseClass}__header`,
          'mb-[calc(var(--base)/2)] flex flex-col gap-[calc(var(--base)/4)]',
        ])}
      >
        <h3 className="text-xl text-(--theme-text) leading-6 font-mono">{label}</h3>

        <Collapsible.Root
          className={cn(`${fieldBaseClass}__description`, 'flex flex-col')}
          open={collapsibleOpen}
          onOpenChange={setCollapsibleOpen}
        >
          <div
            className={cn([
              `${fieldBaseClass}__description-content`,
              'grid grid-cols-[1fr_min-content] gap-4',
            ])}
          >
            <RenderCustomComponent
              CustomComponent={DescriptionComponent}
              Fallback={<FieldDescription description={descriptionFromProps} path={path} />}
            />
            <Collapsible.Trigger asChild>
              <button
                type="button"
                className={cn([
                  `${fieldBaseClass}__description-trigger`,
                  'm-0 p-0 border-none rounded-full',
                  'text-[40px] h-[1em] w-[1em]',
                  'transition-all hover:drop-shadow-sm',
                  collapsibleOpen
                    ? 'bg-info text-background'
                    : 'bg-background text-foreground hover:text-info',
                ])}
              >
                <Icon name="material-symbols:info-outline" />
              </button>
            </Collapsible.Trigger>
          </div>

          <Collapsible.Content
            className={cn([
              collapsibleOpen ? 'max-h-none' : 'max-h-0',
              'overflow-hidden',
            ])}
            forceMount
          >
            <div
              className={cn([
                collapsibleOpen ? 'animate-slide-down' : 'animate-slide-up',
              ])}
            >
              <div className="block columns-2 gap-12">
                {annotations.map(({ label, entries }, index) => (
                  <div key={index} className="inline-grid grid-cols-[min-content_auto] w-full py-2">
                    <header className="col-span-2">
                      <span
                        className={cn([
                          'block pb-0.5 mb-2 border-b border-primary/50',
                          'text-sm text-left text-primary font-mono font-medium',
                        ])}
                      >
                        {label}
                      </span>
                    </header>

                    {Object.entries(entries).map(([key, value], index) => (
                      <div
                        key={index}
                        className={cn([
                          'col-span-2 grid grid-cols-subgrid gap-6',
                          'text-xs py-0.5',
                        ])}
                      >
                        <div className="font-medium tracking-tighter font-mono">{key}</div>
                        <div>{value}</div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </Collapsible.Content>
        </Collapsible.Root>
      </header>

      <div className={`${fieldBaseClass}__wrap`}>
        <RenderCustomComponent
          CustomComponent={ErrorComponent}
          Fallback={
            <FieldError
              path={path}
              showError={showError || hasRenderErrors}
              message={errorMessage || renderError}
            />
          }
        />
        <input
          className="form-input font-mono"
          disabled={readOnly || formProcessing || formInitializing}
          id={`field-${path?.replace(/\./g, '__')}`}
          name={path}
          onChange={(event) => {
            if (!formInitializing && !formProcessing && !readOnly) handleChange(event)
          }}
          placeholder={placeholder}
          ref={inputRef}
          type="text"
          value={template}
        />
        <div
          className={cn([
            'grid gap-4 mt-4',
            renderedResults.length > 1 ? 'grid-cols-2' : 'grid-cols-1',
          ])}
        >
          {renderedResults.map((result, index) => (
            <input value={result} key={index} className="font-mono col-span-1" readOnly />
          ))}
        </div>
      </div>
    </div>
  )
}

export default FieldComponentClient
