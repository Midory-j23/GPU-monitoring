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
  {
    id: 'c1', name: 'Arvin Analytics', nameFa: 'آروین آنالیتیکس', since: '2025-03', gpuHours: 430,
    contactName: { en: 'Sara Moradi', fa: 'سارا مرادی' }, phone: '+98 21 5555 0101', mobile: '+98 912 000 0101', email: 'info@arvin-analytics.example', website: 'https://arvin-analytics.example',
    address: { street: { en: 'No. 12, Valiasr St., Block 3', fa: 'خیابان ولیعصر، پلاک ۱۲، بلوک ۳' }, city: { en: 'Tehran', fa: 'تهران' }, province: { en: 'Tehran', fa: 'تهران' }, country: { en: 'Iran', fa: 'ایران' }, postalCode: '1969712345' },
    registrationNo: '412345', taxId: '411234567890', industry: { en: 'Data analytics', fa: 'تحلیل داده' }, plan: 'Business', contractEnd: '2027-03', accountManager: { en: 'Reza Karimi', fa: 'رضا کریمی' },
    notes: { en: 'Runs nightly reporting jobs on shared vGPUs.', fa: 'گزارش\u200cهای شبانه را روی vGPUهای اشتراکی اجرا می\u200cکند.' },
  },
  {
    id: 'c2', name: 'Pars Render Studio', nameFa: 'پارس رندر استودیو', since: '2024-11', gpuHours: 1180,
    contactName: { en: 'Nima Hosseini', fa: 'نیما حسینی' }, phone: '+98 31 3555 0202', mobile: '+98 913 000 0202', email: 'studio@pars-render.example', website: 'https://pars-render.example',
    address: { street: { en: 'No. 48, Chahar Bagh Abbasi St.', fa: 'خیابان چهارباغ عباسی، پلاک ۴۸' }, city: { en: 'Isfahan', fa: 'اصفهان' }, province: { en: 'Isfahan', fa: 'اصفهان' }, country: { en: 'Iran', fa: 'ایران' }, postalCode: '8143612345' },
    registrationNo: '208811', taxId: '411987654321', industry: { en: '3D rendering & animation', fa: 'رندر سه\u200cبعدی و انیمیشن' }, plan: 'Enterprise', contractEnd: '2026-12', accountManager: { en: 'Reza Karimi', fa: 'رضا کریمی' },
    notes: { en: 'Peak load before project deadlines; needs 24-hour support.', fa: 'در نزدیکی موعد پروژه\u200cها بار بالایی دارد؛ پشتیبانی ۲۴ ساعته لازم است.' },
  },
  {
    id: 'c3', name: 'Sepehr AI Lab', nameFa: 'آزمایشگاه هوش مصنوعی سپهر', since: '2025-06', gpuHours: 1620,
    contactName: { en: 'Dr. Maryam Rahimi', fa: 'دکتر مریم رحیمی' }, phone: '+98 71 3555 0303', mobile: '+98 917 000 0303', email: 'lab@sepehr-ai.example', website: 'https://sepehr-ai.example',
    address: { street: { en: 'Unit 7, Science Park, Zand Blvd.', fa: 'بلوار زند، پارک علم و فناوری، واحد ۷' }, city: { en: 'Shiraz', fa: 'شیراز' }, province: { en: 'Fars', fa: 'فارس' }, country: { en: 'Iran', fa: 'ایران' }, postalCode: '7134812345' },
    registrationNo: '315522', taxId: '411555666777', industry: { en: 'AI research', fa: 'پژوهش هوش مصنوعی' }, plan: 'Enterprise', contractEnd: '2027-06', accountManager: { en: 'Sina Ahmadi', fa: 'سینا احمدی' },
    notes: { en: 'Long-running training jobs; dedicated A30 GPU.', fa: 'آموزش\u200cهای طولانی\u200cمدت؛ یک GPU اختصاصی A30.' },
  },
  {
    id: 'c4', name: 'Kavosh Engineering', nameFa: 'مهندسی کاوش', since: '2024-08', gpuHours: 760,
    contactName: { en: 'Amir Jafari', fa: 'امیر جعفری' }, phone: '+98 41 3555 0404', mobile: '+98 914 000 0404', email: 'office@kavosh-eng.example', website: 'https://kavosh-eng.example',
    address: { street: { en: 'Tower B, Floor 5, Imam Khomeini St.', fa: 'خیابان امام خمینی، برج ب، طبقه ۵' }, city: { en: 'Tabriz', fa: 'تبریز' }, province: { en: 'East Azerbaijan', fa: 'آذربایجان شرقی' }, country: { en: 'Iran', fa: 'ایران' }, postalCode: '5157712345' },
    registrationNo: '129034', taxId: '411222333444', industry: { en: 'Engineering & CAD', fa: 'مهندسی و طراحی صنعتی' }, plan: 'Standard', contractEnd: '2026-11', accountManager: { en: 'Sina Ahmadi', fa: 'سینا احمدی' },
    notes: { en: 'CAD virtual desktops for 25 engineers.', fa: 'دسکتاپ\u200cهای مجازی CAD برای ۲۵ مهندس.' },
  },
  {
    id: 'c5', name: 'Dena HealthTech', nameFa: 'دنا هلث\u200cتک', since: '2026-01', gpuHours: 90,
    contactName: { en: 'Dr. Leila Najafi', fa: 'دکتر لیلا نجفی' }, phone: '+98 51 3555 0505', mobile: '+98 915 000 0505', email: 'it@dena-health.example', website: 'https://dena-health.example',
    address: { street: { en: 'Medical Tech Hub, Vakilabad Blvd.', fa: 'بلوار وکیل\u200cآباد، مرکز فناوری پزشکی' }, city: { en: 'Mashhad', fa: 'مشهد' }, province: { en: 'Razavi Khorasan', fa: 'خراسان رضوی' }, country: { en: 'Iran', fa: 'ایران' }, postalCode: '9185712345' },
    registrationNo: '502177', taxId: '411777888999', industry: { en: 'Healthcare AI', fa: 'هوش مصنوعی سلامت' }, plan: 'Trial', contractEnd: '2026-12', accountManager: { en: 'Reza Karimi', fa: 'رضا کریمی' },
    notes: { en: 'Evaluating imaging models; T4 GPUs on trial.', fa: 'در حال ارزیابی مدل\u200cهای تصویربرداری؛ GPUهای T4 به\u200cصورت آزمایشی.' },
  },
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