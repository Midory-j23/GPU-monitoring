import { useTranslation } from 'react-i18next'
import type { Vgpu } from '@/api/types'
import { AllocPanel } from '@/components/AllocPanel'
import { DataTable, type Col } from '@/components/DataTable'
import { Guard } from '@/components/Guard'
import { Page } from '@/components/Page'
import { StatusBadge } from '@/components/StatusBadge'
import { useCustomers, useGpus, useServers, useVgpus } from '@/hooks/queries'
import { useFmt } from '@/lib/format'
import { useSettings } from '@/lib/settings'

export default function Vgpus() {
  const { t } = useTranslation(), f = useFmt(), { serverId, lang } = useSettings()
  const vq = useVgpus(), gq = useGpus(), sq = useServers(), cq = useCustomers()
  const gpus = gq.data ?? [], gpu = (id: string) => gpus.find((g) => g.id === id)
  const host = (v: Vgpu) => (sq.data ?? []).find((s) => s.id === gpu(v.gpuId)?.serverId)?.host ?? ''
  const cust = (v: Vgpu) => { const c = (cq.data ?? []).find((x) => x.id === v.customerId); return c ? (lang === 'fa' ? c.nameFa : c.name) : '' }
  const rows = (vq.data ?? []).filter((v) => serverId === 'all' || gpu(v.gpuId)?.serverId === serverId)
  // ── EDIT HERE: columns of the vGPU table ──
  const cols: Col<Vgpu>[] = [
    { key: 'vm', header: 'vm', cell: (v) => <span className="ltr">{v.vm}</span>, sort: (v) => v.vm },
    { key: 'cust', header: 'cust', cell: cust, sort: cust },
    { key: 'gpu', header: 'gpu', cell: (v) => `${gpu(v.gpuId)?.name.replace('NVIDIA ', '')} #${f.n(gpu(v.gpuId)?.index, 0)}`, sort: (v) => gpu(v.gpuId)?.name ?? '' },
    { key: 'host', header: 'host', cell: (v) => <span className="ltr">{host(v)}</span>, sort: host },
    { key: 'prof', header: 'prof', cell: (v) => <span className="ltr">{v.profile}</span>, sort: (v) => v.profile },
    { key: 'alloc', header: 'allocFb', cell: (v) => `${f.n(v.allocGb, 0)} GB`, sort: (v) => v.allocGb },
    { key: 'guest', header: 'guestFb', cell: (v) => (v.usedGb == null ? f.n(null) : `${f.n(v.usedGb)} GB`), sort: (v) => v.usedGb },
    { key: 'util', header: 'vutil', cell: (v) => (v.running ? f.n(v.util, 0) + '%' : f.n(null)), sort: (v) => (v.running ? v.util : null) },
    { key: 'pw', header: 'pw', cell: (v) => t(v.running ? 'run' : 'stop'), sort: (v) => Number(v.running) },
    { key: 'health', header: 'health', cell: (v) => <StatusBadge status={v.health} />, sort: (v) => v.health },
  ]
  return (
    <Page id="vgpus">
      <Guard queries={[vq, gq, sq, cq]}>
        <DataTable rows={rows} cols={cols} rowKey={(v) => v.id} status={(v) => v.health} search={(v) => `${v.vm} ${v.profile} ${v.uuid} ${cust(v)}`} />
        <div><AllocPanel gpus={gpus.filter((g) => serverId === 'all' || g.serverId === serverId)} vgpus={rows} /></div>
      </Guard>
    </Page>
  )
}
