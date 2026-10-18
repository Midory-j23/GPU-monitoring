import { Tag } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { DataTable, type Col } from '@/components/DataTable'
import { Guard } from '@/components/Guard'
import { MetricCard } from '@/components/MetricCard'
import { Page } from '@/components/Page'
import { StatusBadge } from '@/components/StatusBadge'
import { useCustomers, useGpus, useServers, useVgpus } from '@/hooks/queries'
import { customerStats, type CustomerStats } from '@/lib/customers'
import { useFmt } from '@/lib/format'
import { useSettings } from '@/lib/settings'
import { loadColor } from '@/lib/status'
import { sum } from '@/lib/utils'

export default function Customers() {
  const { t } = useTranslation(), f = useFmt(), nav = useNavigate(), { serverId, lang } = useSettings()
  const cq = useCustomers(), gq = useGpus(), vq = useVgpus(), sq = useServers()
  const gpus = gq.data ?? [], vgpus = vq.data ?? [], name = (s: CustomerStats) => (lang === 'fa' ? s.c.nameFa : s.c.name)
  const inScope = (s: CustomerStats) => serverId === 'all' || s.gpus.some((g) => g.serverId === serverId) || s.vgpus.some((v) => gpus.find((g) => g.id === v.gpuId)?.serverId === serverId)
  const rows = (cq.data ?? []).map((c) => customerStats(c, gpus, vgpus)).filter(inScope)
  // ── EDIT HERE: columns of the customers table ──
  const cols: Col<CustomerStats>[] = [
    { key: 'name', header: 'cust', cell: (s) => <>{name(s)}{s.util < 20 && <Tag color="warning" className="ms-2">{t('underused')}</Tag>}</>, sort: name },
    { key: 'ded', header: 'dedGpu', cell: (s) => f.n(s.gpus.length, 0), sort: (s) => s.gpus.length },
    { key: 'vg', header: 'vg', cell: (s) => f.n(s.vgpus.length, 0), sort: (s) => s.vgpus.length },
    { key: 'alloc', header: 'allocGb', cell: (s) => `${f.n(s.allocGb, 0)} GB`, sort: (s) => s.allocGb },
    { key: 'used', header: 'usedGb', cell: (s) => `${f.n(s.usedGb)} GB`, sort: (s) => s.usedGb },
    { key: 'util', header: 'avgUtil', cell: (s) => <span className="inline-flex items-center gap-2"><span className="h-2 w-16 overflow-hidden rounded bg-muted"><span className="block h-full" style={{ width: `${s.util}%`, background: loadColor(s.util) }} /></span>{f.n(s.util, 0)}%</span>, sort: (s) => s.util },
    { key: 'hrs', header: 'hrs', cell: (s) => f.n(s.c.gpuHours, 0), sort: (s) => s.c.gpuHours },
    { key: 'status', header: 'status', cell: (s) => <StatusBadge status={s.status} />, sort: (s) => s.status },
  ]
  return (
    <Page id="customers">
      <Guard queries={[cq, gq, vq, sq]}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <MetricCard label={t('customers')} value={f.n(rows.length, 0)} />
          <MetricCard label={t('allocGb')} value={`${f.n(sum(rows.map((r) => r.allocGb)), 0)} GB`} />
          <MetricCard label={t('hrs')} value={f.n(sum(rows.map((r) => r.c.gpuHours)), 0)} />
        </div>
        {/* Clicking a row opens the customer's own page: /customers/:id */}
        <DataTable rows={rows} cols={cols} rowKey={(s) => s.c.id} onRow={(s) => nav(`/customers/${s.c.id}`)} status={(s) => s.status} search={(s) => s.c.name + s.c.nameFa} />
        <p className="text-xs text-muted-foreground">{t('custNote')}</p>
      </Guard>
    </Page>
  )
}
