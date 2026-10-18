import type { TFunction } from 'i18next'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import type { Gpu, Server, Vgpu } from '@/api/types'
import { DataTable, type Col } from '@/components/DataTable'
import { Guard } from '@/components/Guard'
import { Page } from '@/components/Page'
import { StatusBadge } from '@/components/StatusBadge'
import { useCustomers, useGpus, useServers, useVgpus } from '@/hooks/queries'
import { useFmt } from '@/lib/format'
import { useSettings } from '@/lib/settings'

export interface Ctx { f: ReturnType<typeof useFmt>; t: TFunction; lang: string; server: (id: string) => Server | undefined; owners: (g: Gpu) => string }
const ltr = (s?: string) => <span className="ltr">{s}</span>

// ── EDIT HERE: columns of the GPU table (header = translation key) ─────────────────────────
const gpuColumns = (c: Ctx): Col<Gpu>[] => [
  { key: 'name', header: 'name', cell: (g) => g.name, sort: (g) => g.name },
  { key: 'host', header: 'host', cell: (g) => ltr(c.server(g.serverId)?.host), sort: (g) => c.server(g.serverId)?.host ?? '' },
  { key: 'pci', header: 'pci', cell: (g) => ltr(g.pci) },
  { key: 'cust', header: 'cust', cell: (g) => c.owners(g) },
  { key: 'util', header: 'util', cell: (g) => (g.offline ? c.f.n(null) : c.f.n(g.util, 0) + '%'), sort: (g) => (g.offline ? null : g.util) },
  { key: 'mem', header: 'mem', cell: (g) => (g.offline ? c.f.n(null) : `${c.f.n(g.memUsedGb)} / ${c.f.n(g.memTotalGb, 0)} GB`), sort: (g) => (g.offline ? null : g.memUsedGb / g.memTotalGb) },
  { key: 'temp', header: 'temp', cell: (g) => (g.offline ? c.f.n(null) : c.f.n(g.temp, 0) + ' °C'), sort: (g) => (g.offline ? null : g.temp) },
  { key: 'power', header: 'power', cell: (g) => (g.offline ? c.f.n(null) : `${c.f.n(g.powerW, 0)} / ${c.f.n(g.powerLimitW, 0)} W`), sort: (g) => (g.offline ? null : g.powerW) },
  { key: 'fan', header: 'fan', cell: (g) => (g.offline || g.fanPct == null ? c.f.n(null) : c.f.n(g.fanPct, 0) + '%'), sort: (g) => (g.offline ? null : g.fanPct) },
  { key: 'status', header: 'status', cell: (g) => <StatusBadge status={g.status} />, sort: (g) => g.status },
]
// ── EDIT HERE: rows of the GPU detail drawer (k = translation key) ─────────────────────────
export const gpuDetails: { k: string; v: (g: Gpu, c: Ctx) => ReactNode }[] = [
  { k: 'uuid', v: (g) => ltr(g.uuid) }, { k: 'idx', v: (g, c) => c.f.n(g.index, 0) },
  { k: 'host', v: (g, c) => ltr(c.server(g.serverId)?.host) }, { k: 'pci', v: (g) => ltr(g.pci) },
  { k: 'memCap', v: (g, c) => (g.offline ? c.f.n(null) : `${c.f.n(g.memUsedGb)} / ${c.f.n(g.memTotalGb, 0)} GB`) },
  { k: 'drv', v: (g, c) => ltr(c.server(g.serverId)?.driver) },
  { k: 'power', v: (g, c) => (g.offline ? c.f.n(null) : c.f.n(g.powerW, 0) + ' W') }, { k: 'plim', v: (g, c) => c.f.n(g.powerLimitW, 0) + ' W' },
  { k: 'clk', v: (g, c) => (g.offline ? c.f.n(null) : c.f.n(g.clockMhz, 0) + ' MHz') },
  { k: 'fan', v: (g, c) => (g.fanPct == null ? c.f.n(null) : c.f.n(g.fanPct, 0) + '%') },
  { k: 'ecc', v: (g, c) => (g.offline ? c.f.n(null) : c.t('ecc0')) },
  { k: 'pers', v: (g, c) => (g.offline ? c.f.n(null) : c.lang === 'fa' ? 'فعال' : 'Enabled') },
]
export const procs = (g: Gpu, vgpus: Vgpu[]): [string, string | number, number][] => {
  if (g.offline) return []
  const v = vgpus.filter((x) => x.gpuId === g.id)
  return v.length ? v.map((x) => [x.vm, 'vGPU', x.usedGb ?? 0]) : [['python3 train.py', 12340 + g.index, g.memUsedGb * 0.8], ['tensorboard', 9812 + g.index, g.memUsedGb * 0.2]]
}

export default function Gpus() {
  const { t } = useTranslation(), f = useFmt(), { serverId, lang } = useSettings(), nav = useNavigate()
  const gq = useGpus(), sq = useServers(), vq = useVgpus(), cq = useCustomers()
  const servers = sq.data ?? [], vgpus = vq.data ?? [], customers = cq.data ?? []
  const cname = (id: string) => { const c = customers.find((x) => x.id === id); return c ? (lang === 'fa' ? c.nameFa : c.name) : '' }
  const ctx: Ctx = {
    f, t, lang, server: (id) => servers.find((s) => s.id === id),
    owners: (g) => g.customerId ? cname(g.customerId) : [...new Set(vgpus.filter((v) => v.gpuId === g.id).map((v) => cname(v.customerId)))].join(lang === 'fa' ? '، ' : ', ') || '—',
  }
  const rows = (gq.data ?? []).filter((g) => serverId === 'all' || g.serverId === serverId)
  return (
    <Page id="gpus">
      <Guard queries={[gq, sq, vq, cq]}>
        {/* Clicking a row opens the GPU's own page: /gpus/:id */}
        <DataTable rows={rows} cols={gpuColumns(ctx)} rowKey={(g) => g.id} onRow={(g) => nav(`/gpus/${g.id}`)} status={(g) => g.status}
          search={(g) => `${g.name} ${g.pci} ${ctx.server(g.serverId)?.host ?? ''} ${ctx.owners(g)}`} />
      </Guard>
    </Page>
  )
}
