import type { Customer, Gpu, Status, Vgpu } from '@/api/types'
import { RANK } from './status'
import { sum } from './utils'

export interface CustomerStats { c: Customer; gpus: Gpu[]; vgpus: Vgpu[]; allocGb: number; usedGb: number; util: number; status: Status }

/** Usage per customer. Utilization is weighted by allocated memory. */
export function customerStats(c: Customer, gpus: Gpu[], vgpus: Vgpu[]): CustomerStats {
  const g = gpus.filter((x) => x.customerId === c.id), v = vgpus.filter((x) => x.customerId === c.id)
  const allocGb = sum(g.map((x) => x.memTotalGb)) + sum(v.map((x) => x.allocGb))
  const usedGb = sum(g.map((x) => x.memUsedGb)) + sum(v.map((x) => x.usedGb ?? 0))
  const util = allocGb
    ? (sum(g.map((x) => (x.offline ? 0 : x.util * x.memTotalGb))) + sum(v.map((x) => (x.running ? x.util * x.allocGb : 0)))) / allocGb
    : 0
  const status = [...g.map((x) => x.status), ...v.map((x) => x.health)].reduce<Status>((a, b) => (RANK[b] > RANK[a] ? b : a), 'ok')
  return { c, gpus: g, vgpus: v, allocGb, usedGb, util, status }
}
