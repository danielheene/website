import { ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export type { ClassValue } from 'clsx'
export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs))
