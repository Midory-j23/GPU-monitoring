// MOCK DATA — the only file that fabricates values. Real data comes from client.ts when VITE_USE_MOCK=false.
import { customerStats } from '@/lib/customers'
import type { Alert, Customer, Gpu, Point, Server, Status, Vgpu } from './types'

export const gpuStatus = (g: Pick<Gpu, 'offline' | 'temp' | 'util'>): Status =>
  g.offline ? 'na' : g.temp >= 85 || g.util >= 95 ? 'crit' : g.temp >= 78 || g.util >= 85 ? 'warn' : 'ok'

const servers: Server[] = [
  { id: 's1', host: 'gpu-node-01', ip: '10.20.1.11', os: 'Ubuntu 22.04', driver: '550.90.07', online: true, lastSeenSec: 5 },
  { id: 's2', host: 'gpu-node-02', ip: '10.20.1.12', os: 'Ubuntu 22.04', driver: '550.90.07', online: true, lastSeenSec: 8 },
  { id: 's3', host: 'vgpu-host-01', ip: '10.20.2.5', os: 'RHEL 9.4', driver: '550.90.05-vgpu', online: false, lastSeenSec: 1260 },
]
const models: [string, number][] = [['A100 80GB', 80], ['A100 80GB', 80], ['L40S', 48], ['L40S', 48], ['A30', 24], ['A30', 24], ['T4', 16], ['T4', 16]]
const U = [96, 72, 41, 88, 15, 63, 0, 0], MU = [0.78, 0.6, 0.35, 0.81, 0.2, 0.5, 0, 0], TP = [88, 74, 61, 79, 48, 66, 0, 0]
const PW = [390, 300, 180, 255, 70, 110, 0, 0], PL = [400, 400, 350, 350, 165, 165, 70, 70], CK = [1410, 1395, 2520, 2490, 1440, 1440, 1590, 1590]

const gpus: Gpu[] = models.map(([name, cap], i) => {
  const g: Gpu = {
    id: `g${i}`, index: i % 4, name: 'NVIDIA ' + name, serverId: i < 3 ? 's1' : i < 5 ? 's2' : 's3',
    pci: `0000:${i < 3 ? '3b' : 'af'}:00.${i % 4}`,
    uuid: `GPU-${(1e7 + i * 7919).toString(16)}-a1b2-4c3d-9e8f-${(5e11 + i * 977).toString(16)}`,
    util: U[i], memTotalGb: cap, memUsedGb: +(cap * MU[i]).toFixed(1), temp: TP[i], powerW: PW[i], powerLimitW: PL[i],
    fanPct: i % 3 === 2 ? null : [70, 52, 0, 64, 0, 40][i % 6], clockMhz: CK[i], offline: i > 5,
    customerId: i === 5 ? 'c3' : i > 5 ? 'c5' : undefined, status: 'ok',
  }
  g.status = gpuStatus(g)
  return g
})
const customers: Customer[] = [
  { id: 'c1', name: 'Arvin Analytics', nameFa: 'آروین آنالیتیکس', since: '2025-03', gpuHours: 430 },
  { id: 'c2', name: 'Pars Render Studio', nameFa: 'پارس رندر استودیو', since: '2024-11', gpuHours: 1180 },
  { id: 'c3', name: 'Sepehr AI Lab', nameFa: 'آزمایشگاه هوش مصنوعی سپهر', since: '2025-06', gpuHours: 1620 },
  { id: 'c4', name: 'Kavosh Engineering', nameFa: 'مهندسی کاوش', since: '2024-08', gpuHours: 760 },
  { id: 'c5', name: 'Dena HealthTech', nameFa: 'دنا هلث‌تک', since: '2026-01', gpuHours: 90 },
]
// [vm, gpu index, profile, allocated GB, guest-used GB, util, running, owner]
const vg: [string, number, string, number, number | null, number, boolean, string][] = [
  ['win11-cad-01', 0, 'A100-8C', 8, 6.1, 55, true, 'c4'], ['ml-train-02', 0, 'A100-40C', 40, 31, 92, true, 'c3'],
  ['vdi-pool-07', 1, 'A100-10C', 10, 3.2, 18, true, 'c4'], ['vdi-pool-08', 1, 'A100-10C', 10, null, 0, false, 'c1'],
  ['render-03', 2, 'L40S-12Q', 12, 7.9, 48, true, 'c2'], ['vdi-pool-11', 2, 'L40S-6Q', 6, 2.1, 21, true, 'c2'],
  ['cad-dev-04', 3, 'L40S-24Q', 24, 17.5, 66, true, 'c2'], ['analytics-01', 4, 'A30-12C', 12, 5.4, 30, true, 'c1'],
]
const vgpus: Vgpu[] = vg.map(([vm, gi, profile, allocGb, usedGb, util, running, customerId], i) => ({
  id: `vg${i}`, uuid: `vGPU-${(2e7 + i * 4127).toString(16)}-77ab`, vm, gpuId: `g${gi}`, profile, allocGb, usedGb, util, running, customerId,
  health: vm === 'vdi-pool-08' ? 'na' : vm === 'ml-train-02' ? 'warn' : 'ok',
}))
const alerts: Alert[] = [
  { id: 1, severity: 'crit', serverId: 's1', gpuIndex: 0, minutesAgo: 3, en: 'GPU temperature 88 °C above 85 °C threshold', fa: 'دمای GPU برابر ۸۸ درجه و بالاتر از آستانه ۸۵ درجه است', acked: false },
  { id: 2, severity: 'crit', serverId: 's3', gpuIndex: null, minutesAgo: 19, en: 'Collector heartbeat missing for 21 minutes', fa: 'بیش از ۲۱ دقیقه است که پالس کلکتور دریافت نشده', acked: false },
  { id: 3, severity: 'warn', serverId: 's2', gpuIndex: 3, minutesAgo: 42, en: 'Memory utilization 81% above 80% threshold', fa: 'مصرف حافظه ۸۱٪ و بالاتر از آستانه ۸۰٪ است', acked: false },
  { id: 4, severity: 'warn', serverId: 's1', gpuIndex: 1, minutesAgo: 75, en: 'vGPU ml-train-02 uses 78% of its allocated framebuffer', fa: 'vGPU ماشین ml-train-02 در حال استفاده از ۷۸٪ فریم‌بافر تخصیصی است', acked: true },
]

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))
const rnd = (a: number) => (Math.random() - 0.5) * a
function jitter() {
  for (const g of gpus) {
    if (g.offline) continue
    g.util = clamp(Math.round(g.util + rnd(8)), 1, 100)
    g.temp = clamp(Math.round(g.temp + rnd(3)), 35, 92)
    g.powerW = clamp(Math.round(g.powerW + rnd(20)), 20, g.powerLimitW)
    g.status = gpuStatus(g)
  }
}
const wave = (b: number, a: number, max: number, i: number, ph: number) =>
  clamp(b + Math.sin(i / 4 + ph) * a * 3 + Math.cos(i * 1.7) * a, 0, max)

/** Demo accounts — mock mode only. Real authentication happens on the backend. */
export const DEMO_USERS: Record<string, [string, 'admin' | 'operator' | 'viewer']> = {
  admin: ['admin123', 'admin'], operator: ['operator123', 'operator'], viewer: ['viewer123', 'viewer'],
}

export const mock = {
  login: (u: string, p: string) => { const d = DEMO_USERS[u]; return d && d[0] === p ? { username: u, role: d[1] } : null },
  servers: () => servers.map((s) => ({ ...s })),
  gpus: () => { jitter(); return gpus.map((g) => ({ ...g })) },
  vgpus: () => vgpus.map((v) => ({ ...v })),
  customers: () => customers.map((c) => ({ ...c })),
  alerts: () => alerts.map((a) => ({ ...a })),
  overview: (): Point[] => {
    const on = gpus.filter((g) => !g.offline), n = on.length || 1
    const u = on.reduce((s, g) => s + g.util, 0) / n, t = on.reduce((s, g) => s + g.temp, 0) / n
    const m = (on.reduce((s, g) => s + g.memUsedGb, 0) / on.reduce((s, g) => s + g.memTotalGb, 1)) * 100
    const p = on.reduce((s, g) => s + g.powerW, 0), ph = Date.now() / 60000
    return Array.from({ length: 40 }, (_, i) => ({
      m: (39 - i) * 0.5, util: wave(u, 6, 100, i, ph), mem: wave(m, 4, 100, i, ph), temp: wave(t, 3, 100, i, ph), power: wave(p, 40, p * 1.4, i, ph),
    }))
  },
  gpuMetrics: (id: string): Point[] => {
    const g = gpus.find((x) => x.id === id), ph = Date.now() / 60000
    if (!g || g.offline) return []
    return Array.from({ length: 40 }, (_, i) => ({
      m: (39 - i) * 0.5, util: wave(g.util, 5, 100, i, ph), mem: wave((g.memUsedGb / g.memTotalGb) * 100, 3, 100, i, ph),
      temp: wave(g.temp, 2, 100, i, ph), power: wave(g.powerW, 15, g.powerLimitW, i, ph),
    }))
  },
  customerUsage: (id: string) => {
    const c = customers.find((x) => x.id === id), u = c ? customerStats(c, gpus, vgpus).util : 0, ph = Date.now() / 60000
    return Array.from({ length: 40 }, (_, i) => ({ m: Math.round(((39 - i) * 30) / 39), util: wave(u, 6, 100, i, ph) }))
  },
  ack: (ids: number[]) => { alerts.forEach((a) => { if (ids.includes(a.id)) a.acked = true }) },
}
