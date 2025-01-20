import { type Config, ResumeCustomer } from '@payload-types'
import { Merge, SetNonNullable } from 'type-fest'
import { DataFromGlobalSlug } from 'payload'
import { Key } from 'react'

export type Global = keyof Config['globals']

export type GlobalData<S extends Global> = Merge<DataFromGlobalSlug<S>, { globalType: S }>

export type SectionData<S extends Global> = Omit<
  Merge<
    DataFromGlobalSlug<S>,
    {
      globalType: S
    }
  >,
  '_status' | 'createdAt' | 'updatedAt'
>

export type SectionProps<S extends Global> = Omit<
  Merge<
    DataFromGlobalSlug<S>,
    {
      globalType: S
      key?: Key
      className?: string
    }
  >,
  '_status' | 'createdAt' | 'updatedAt' | 'id'
>

export type ThemeColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'slate'
  | 'gray'
  | 'zinc'
  | 'neutral'
  | 'stone'
  | 'red'
  | 'orange'
  | 'amber'
  | 'yellow'
  | 'lime'
  | 'green'
  | 'emerald'
  | 'teal'
  | 'cyan'
  | 'sky'
  | 'blue'
  | 'indigo'
  | 'violet'
  | 'purple'
  | 'fuchsia'
  | 'pink'
  | 'rose'

export type CustomerEntry = SetNonNullable<Required<ResumeCustomer['entries'][number]>>
