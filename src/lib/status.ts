import type { Status } from '@/api/types'
export const STATUS_COLOR: Record<Status, string> = {
  ok: 'hsl(var(--ok))', warn: 'hsl(var(--warn))', crit: 'hsl(var(--crit))', na: 'hsl(var(--na))',
}
export const loadColor = (u: number) => (u >= 90 ? STATUS_COLOR.crit : u >= 70 ? STATUS_COLOR.warn : u >= 1 ? STATUS_COLOR.ok : STATUS_COLOR.na)
export const RANK: Record<Status, number> = { ok: 0, na: 1, warn: 2, crit: 3 }
