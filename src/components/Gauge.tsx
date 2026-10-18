import { useFmt } from '@/lib/format'
export function Gauge({ value, max = 100, label, unit, color }: { value: number; max?: number; label: string; unit: string; color: string }) {
  const f = useFmt(), C = 2 * Math.PI * 34, arc = 0.75 * C, fill = Math.min(1, value / max) * arc
  const ring = (dash: number, stroke: string) => (
    <circle cx="45" cy="45" r="34" fill="none" stroke={stroke} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${dash} ${C}`} transform="rotate(135 45 45)" />
  )
  return (
    <div className="text-center">
      <svg viewBox="0 0 90 90" width="84" height="84" style={{ direction: "ltr" }} role="img" aria-label={`${label} ${value}${unit}`}>
        {ring(arc, 'hsl(var(--muted))')}{ring(fill, color)}
        <text x="45" y="50" textAnchor="middle" fontSize="15" fontWeight="700" fill="hsl(var(--foreground))">{f.n(value, 0)}{unit}</text>
      </svg>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  )
}
