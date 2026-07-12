import { ClassNameValue as ClassValue, twMerge } from 'tailwind-merge'

export const cn = (...inputs: ClassValue[]): string => twMerge(...inputs)
export type { ClassNameValue as ClassValue } from 'tailwind-merge'
