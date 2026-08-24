'use client'

import { ChangeEvent, JSX, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { TextFieldClientProps } from 'payload'
import { getTranslation } from '@payloadcms/translations'
import {
  FieldDescription,
  FieldError,
  FieldLabel,
  fieldBaseClass,
  RenderCustomComponent,
  useField,
  useTranslation,
} from '@payloadcms/ui'
import { mergeFieldStyles } from '@payloadcms/ui/shared'

import * as Collapsible from '@radix-ui/react-collapsible'

import { Button } from '@/components/Button'
import { Icon } from '@/components/Icon'
import { TemplateFieldAnnotation, TemplateFieldData } from '@/fields/Template/types'
import { cn } from '@/lib/cn'
import { BilingualLanguage } from '@/lib/i18n'
import { renderTemplate } from '@/lib/renderTemplate'

type FieldComponentClientProps = TextFieldClientProps & {
  annotations?: TemplateFieldAnnotation[]
  data?: TemplateFieldData
  renderLocale?: BilingualLanguage[]
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
          'flex flex-col gap-[calc(var(--base)/4)]',
        ])}
      >
        <Collapsible.Root open={collapsibleOpen} onOpenChange={setCollapsibleOpen}>
          <header
            className={cn([
              `${fieldBaseClass}__header`,
              'relative flex flex-col gap-1 pr-10 mb-3.5',
              '[&_.field-label]:text-xl [&_.field-label]:text-(--theme-text)',
              '[&_.field-label]:font-mono [&_.field-label]:leading-relaxed',
              '[&_.field-description]:m-0 [&_.field-description]:text-(--theme-elevation-400)',
            ])}
          >
            <RenderCustomComponent
              CustomComponent={LabelComponent}
              Fallback={<FieldLabel label={label} path={path} as="h3" />}
            />

            <RenderCustomComponent
              CustomComponent={DescriptionComponent}
              Fallback={
                <FieldDescription
                  description={descriptionFromProps}
                  path={path}
                  className={cn([
                    'mb-0',
                  ])}
                />
              }
            />

            <Collapsible.Trigger asChild>
              <Button
                className={cn([
                  `${fieldBaseClass}__description-trigger`,
                  'absolute right-0 bottom-2.5',
                ])}
                type="button"
                variant={collapsibleOpen ? 'ghost' : 'outline'}
                size="icon-sm"
              >
                {collapsibleOpen ? (
                  <Icon name="material-symbols:collapse-all" />
                ) : (
                  <Icon name="material-symbols:expand-all" />
                )}
              </Button>
            </Collapsible.Trigger>
          </header>

          <Collapsible.Content
            className={cn([
              collapsibleOpen ? 'max-h-none' : 'max-h-0',
              'overflow-hidden',
            ])}
            forceMount
          >
            <div
              className={cn([
                'pb-2.5',
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
