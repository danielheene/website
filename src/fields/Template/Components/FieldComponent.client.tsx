import { Collapsible } from 'radix-ui'

import { fieldBaseClass, RenderCustomComponent, useField } from '@payloadcms/ui'
import { FieldDescription } from '@payloadcms/ui/fields/FieldDescription'
import { FieldError } from '@payloadcms/ui/fields/FieldError'
import { FieldLabel } from '@payloadcms/ui/fields/FieldLabel'
import { TextInput } from '@payloadcms/ui/fields/Text'
import { useThrottledValue } from '@payloadcms/ui/hooks/useThrottledValue'
import { TextFieldClientComponent, TextFieldClientProps } from 'payload'
import { useRef, useState } from 'react'

import { Button } from '@/components/Button'
import { cn } from '@/lib/cn'

export const FieldComponentClient: TextFieldClientComponent = ({
  field,
  path,
  readOnly,
}: TextFieldClientProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const initialRenderRef = useRef(true)

  const [localValue, setLocalValue] = useState<string>('')
  const throttledLocalValue = useThrottledValue(localValue, 500)

  const {
    label,
    name,
    admin: { placeholder, description },
  } = field
  const {
    value: fieldValue,
    setValue: setFieldValue,
    showError,

    customComponents: { Description, Label },
  } = useField<number>({
    potentiallyStalePath: path,
  })

  return (
    <div className={cn(fieldBaseClass, 'template', showError && 'error', readOnly && 'read-only')}>
      <header className={cn(`${fieldBaseClass}__header`)}>
        <RenderCustomComponent
          CustomComponent={Label}
          Fallback={<FieldLabel label={label} path={path} />}
        />
        <div
          className={cn([
            `${fieldBaseClass}__description`,
          ])}
        >
          <RenderCustomComponent
            CustomComponent={Description}
            Fallback={<FieldDescription description={description} path={path} />}
          />
          <Collapsible.Root className={cn('CollapsibleRoot')}>
            <Collapsible.Trigger className="CollapsibleTrigger" asChild>
              <Button variant="secondary" size="clear">
                Show more
              </Button>
            </Collapsible.Trigger>
            <Collapsible.Content>
              <div
                className={cn(
                  'overflow-hidden',
                  'data-[state=open]:animate-slide-down',
                  'data-[state=closed]:animate-slide-up',
                )}
              >
                <RenderCustomComponent
                  CustomComponent={Description}
                  Fallback={<FieldDescription description={description} path={path} />}
                />
              </div>
            </Collapsible.Content>
          </Collapsible.Root>
        </div>
      </header>

      <div className={`${fieldBaseClass}__wrap`}>
        <FieldError path={path} showError={showError} />
        <TextInput
          className={cn('input-field')}
          value={localValue}
          onChange={(event) => setLocalValue(event.target.value)}
          placeholder={placeholder}
          path={path || name}
          readOnly={readOnly}
          inputRef={inputRef}
        />
      </div>
    </div>
  )
}

export default FieldComponentClient
