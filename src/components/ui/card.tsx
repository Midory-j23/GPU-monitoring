import { Card as ACard, type CardProps } from 'antd'
import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
export const Card = ({ className, ...p }: CardProps) => <ACard size="small" bordered={false} className={cn('glass', className)} {...p} />
export const CardTitle = ({ className, ...p }: HTMLAttributes<HTMLHeadingElement>) => <h2 className={cn('mb-2 text-sm font-semibold', className)} {...p} />
