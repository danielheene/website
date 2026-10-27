import { CheckboxFieldServerProps } from 'payload'

import { cn } from 'tailwind-variants'

export const FieldComponent = async ({ value }: CheckboxFieldServerProps) => {
  return value ? (
    <div
      className={cn([
        'flex items-center justify-center',
        'my-6 h-10 w-full font-mono font-[500] tracking-wider uppercase',
        'border border-destructive/40 text-destructive',
      ])}
    >
      Protected
    </div>
  ) : null
}

export default FieldComponent
