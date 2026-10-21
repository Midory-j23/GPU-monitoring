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
/** Text stored in both languages (the UI shows the one matching the selected language). */
export interface Localized { en: string; fa: string }
export interface Address { street: Localized; city: Localized; province: Localized; country: Localized; postalCode: string }
export type Plan = 'Standard' | 'Business' | 'Enterprise' | 'Trial'
export interface Customer {
  id: string; name: string; nameFa: string; since: string; gpuHours: number
  // contact
  contactName: Localized; phone: string; mobile: string; email: string; website: string
  // address
  address: Address
  // account / contract
  registrationNo: string; taxId: string; industry: Localized; plan: Plan; contractEnd: string; accountManager: Localized; notes?: Localized
}
export interface Alert { id: number; severity: 'warn' | 'crit'; serverId: string; gpuIndex: number | null; minutesAgo: number; en: string; fa: string; acked: boolean }
/** One chart sample. `m` = minutes ago. */
export type Point = Record<'m' | 'util' | 'mem' | 'temp' | 'power', number>