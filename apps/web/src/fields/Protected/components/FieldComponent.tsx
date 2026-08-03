import { CheckboxFieldServerProps } from 'payload'

import { cn } from '@repo/utils/cn'

export const FieldComponent = async ({ value }: CheckboxFieldServerProps) => {
  return value ? (
    <div
      className={cn([
        'flex items-center justify-center',
        'h-10 w-full my-6 font-mono font-[500] tracking-wider uppercase',
        'border border-destructive/40 text-destructive',
      ])}
    >
      Protected
    </div>
  ) : null
}

export default FieldComponent
