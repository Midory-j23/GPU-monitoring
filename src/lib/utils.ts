import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
export const cn = (...a: ClassValue[]) => twMerge(clsx(a))
export const sum = (a: number[]) => a.reduce((x, y) => x + y, 0)
