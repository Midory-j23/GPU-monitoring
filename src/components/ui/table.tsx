import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
export const Table = ({ className, ...p }: HTMLAttributes<HTMLTableElement>) => (
  <div className="overflow-x-auto"><table className={cn('w-full min-w-[640px] text-sm', className)} {...p} /></div>
)
export const TH = ({ className, ...p }: ThHTMLAttributes<HTMLTableCellElement>) => (
  <th className={cn('whitespace-nowrap border-b border-border p-2 text-start text-xs font-semibold text-muted-foreground', className)} {...p} />
)
export const TD = ({ className, ...p }: TdHTMLAttributes<HTMLTableCellElement>) => (
  <td className={cn('whitespace-nowrap border-b border-border p-2', className)} {...p} />
)
