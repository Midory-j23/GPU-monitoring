import { Button as AButton, type ButtonProps } from 'antd'
import { cn } from '@/lib/utils'

/** Thin wrapper over Ant Design's Button that keeps the project's variant/size names. */
export function Button({ variant = 'outline', size, className, children, ...p }: Omit<ButtonProps, 'size' | 'variant' | 'type'> & { variant?: 'default' | 'outline' | 'ghost'; size?: 'default' | 'icon' }) {
  return (
    <AButton type={variant === 'default' ? 'primary' : variant === 'ghost' ? 'text' : 'default'} className={cn(size === 'icon' && 'w-8 !px-0', className)} {...p}>{children}</AButton>
  )
}
