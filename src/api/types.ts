export type Status = 'ok' | 'warn' | 'crit' | 'na'

export interface Server { id: string; host: string; ip: string; os: string; driver: string; online: boolean; lastSeenSec: number }
export interface Gpu {
  id: string; index: number; name: string; serverId: string; pci: string; uuid: string
  util: number; memUsedGb: number; memTotalGb: number; temp: number
  powerW: number; powerLimitW: number; fanPct: number | null; clockMhz: number
  offline: boolean; customerId?: string; status: Status
}
export interface Vgpu {
  id: string; uuid: string; vm: string; gpuId: string; profile: string
  allocGb: number; usedGb: number | null; util: number; running: boolean; health: Status; customerId: string
}
export interface Customer { id: string; name: string; nameFa: string; since: string; gpuHours: number }
export interface Alert { id: number; severity: 'warn' | 'crit'; serverId: string; gpuIndex: number | null; minutesAgo: number; en: string; fa: string; acked: boolean }
/** One chart sample. `m` = minutes ago. */
export type Point = Record<'m' | 'util' | 'mem' | 'temp' | 'power', number>
