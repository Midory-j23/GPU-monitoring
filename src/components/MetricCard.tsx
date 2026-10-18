import { Tooltip } from 'antd'
import { Area, AreaChart, ResponsiveContainer } from 'recharts'
import type { Status } from '@/api/types'
import { cn } from '@/lib/utils'
import { Card } from './ui/card'
const border: Record<Status, string> = { ok: 'border-s-ok', warn: 'border-s-warn', crit: 'border-s-crit', na: 'border-s-na' }

/**
 * Summary card. If `spark` or `sub` is given, a footer of fixed height (trend line or small caption) is reserved,
 * so cards in the same grid always have the same size.
 */
export function MetricCard({ label, value, status = 'ok', tip, spark, sub }: { label: string; value: string; status?: Status; tip?: string; spark?: number[]; sub?: string }) {
  return (
    <Tooltip title={tip}>
      <div className="h-full">
        <Card data-metric-card className={cn('h-full border-s-4', border[status])}>
          <div className="text-xs text-muted-foreground">{label}{tip ? ' ⓘ' : ''}</div>
          <div className="text-2xl font-bold tracking-tight">{value}</div>
          {(spark || sub !== undefined) && (
            <div data-metric-footer dir="ltr" className="h-7">
              {spark ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={spark.map((v) => ({ v }))}><Area dataKey="v" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={1.6} dot={false} isAnimationActive={false} /></AreaChart>
                </ResponsiveContainer>
              ) : <span dir="auto" className="flex h-full items-end text-xs text-muted-foreground">{sub}</span>}
            </div>
          )}
        </Card>
      </div>
    </Tooltip>
  )
}
