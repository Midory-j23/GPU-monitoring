import { Tag } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { DataTable, type Col } from '@/components/DataTable'
import { Guard } from '@/components/Guard'
import { MetricCard } from '@/components/MetricCard'
import { Page } from '@/components/Page'
import { StatusBadge } from '@/components/StatusBadge'
import { useCustomers, useGpus, useServers, useVgpus } from '@/hooks/queries'
import { customerStats, tr, type CustomerStats } from '@/lib/customers'
import { useFmt } from '@/lib/format'
import { useSettings } from '@/lib/settings'
import { loadColor } from '@/lib/status'
import { sum } from '@/lib/utils'

const PLAN_COLOR = { Standard: 'blue', Business: 'geekblue', Enterprise: 'purple', Trial: 'default' } as const

export default function Customers() {
  const { t } = useTranslation(), f = useFmt(), nav = useNavigate(), { serverId, lang } = useSettings()
  const cq = useCustomers(), gq = useGpus(), vq = useVgpus(), sq = useServers()
  const gpus = gq.data ?? [], vgpus = vq.data ?? [], name = (s: CustomerStats) => (lang === 'fa' ? s.c.nameFa : s.c.name)
  const inScope = (s: CustomerStats) => serverId === 'all' || s.gpus.some((g) => g.serverId === serverId) || s.vgpus.some((v) => gpus.find((g) => g.id === v.gpuId)?.serverId === serverId)
  const rows = (cq.data ?? []).map((c) => customerStats(c, gpus, vgpus)).filter(inScope)
  // ── EDIT HERE: columns of the customers table ──
  const cols: Col<CustomerStats>[] = [
    { key: 'name', header: 'cust', sort: name, cell: (s) => (
      <>
        <div>{name(s)}{s.util < 20 && <Tag color="warning" className="ms-2">{t('underused')}</Tag>}</div>
        <div className="text-xs text-muted-foreground">{tr(s.c.contactName, lang)}</div>
      </>) },
    { key: 'phone', header: 'cdPhone', cell: (s) => <span className="ltr">{s.c.phone || f.n(null)}</span>, sort: (s) => s.c.phone },
    { key: 'city', header: 'cdCity', cell: (s) => tr(s.c.address.city, lang) || f.n(null), sort: (s) => tr(s.c.address.city, lang) },
    { key: 'ded', header: 'dedGpu', cell: (s) => f.n(s.gpus.length, 0), sort: (s) => s.gpus.length },
    { key: 'vg', header: 'vg', cell: (s) => f.n(s.vgpus.length, 0), sort: (s) => s.vgpus.length },
    { key: 'alloc', header: 'allocGb', cell: (s) => `${f.n(s.allocGb, 0)} GB`, sort: (s) => s.allocGb },
    { key: 'used', header: 'usedGb', cell: (s) => `${f.n(s.usedGb)} GB`, sort: (s) => s.usedGb },
    { key: 'util', header: 'avgUtil', cell: (s) => <span className="inline-flex items-center gap-2"><span className="h-2 w-16 overflow-hidden rounded bg-muted"><span className="block h-full" style={{ width: `${s.util}%`, background: loadColor(s.util) }} /></span>{f.n(s.util, 0)}%</span>, sort: (s) => s.util },
    { key: 'hrs', header: 'hrs', cell: (s) => f.n(s.c.gpuHours, 0), sort: (s) => s.c.gpuHours },
    { key: 'plan', header: 'cdPlan', cell: (s) => <Tag color={PLAN_COLOR[s.c.plan]}>{t('plan_' + s.c.plan)}</Tag>, sort: (s) => s.c.plan },
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
        <DataTable rows={rows} cols={cols} rowKey={(s) => s.c.id} onRow={(s) => nav(`/customers/${s.c.id}`)} status={(s) => s.status} search={(s) => [s.c.name, s.c.nameFa, s.c.contactName.en, s.c.contactName.fa, s.c.phone, s.c.mobile, s.c.email, s.c.address.city.en, s.c.address.city.fa].join(' ')} />
        <p className="text-xs text-muted-foreground">{t('custNote')}</p>
      </Guard>
    </Page>
  )
}
