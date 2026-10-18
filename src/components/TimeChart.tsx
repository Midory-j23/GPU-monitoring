import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useFmt } from '@/lib/format'

export interface Series { key: string; name: string; color: string }
/** Line chart over `m` (minutes ago). The plot is always LTR so time reads left→right, even in Persian. */
export function TimeChart({ data, series, unit, max, height = 170 }: { data: Record<string, number>[]; series: Series[]; unit: string; max?: number; height?: number }) {
  const f = useFmt()
  return (
    <div dir="ltr" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 6, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
          <XAxis dataKey="m" reversed={false} tickFormatter={(v) => `-${f.n(Number(v), 0)}m`} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} minTickGap={30} />
          <YAxis domain={[0, max ?? 'auto']} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => f.n(Number(v), 0)} />
          <Tooltip
            contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
            formatter={(v) => `${f.n(Number(v), 1)} ${unit}`} labelFormatter={(v) => `-${f.n(Number(v), 0)}m`}
          />
          {series.map((s) => <Line key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color} strokeWidth={2} dot={false} isAnimationActive={false} />)}
          {series.length > 1 && <Legend />}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
