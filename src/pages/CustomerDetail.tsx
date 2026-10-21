import { Alert, Progress, Tag } from 'antd'
import { ArrowLeft } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Status } from '@/api/types'
import { DataTable, type Col } from '@/components/DataTable'
import { Guard } from '@/components/Guard'
import { MetricCard } from '@/components/MetricCard'
import { StatusBadge } from '@/components/StatusBadge'
import { TimeChart } from '@/components/TimeChart'
import { Button } from '@/components/ui/button'
import { Card, CardTitle } from '@/components/ui/card'
import { AlertList } from '@/pages/Alerts'
import { useAlerts, useCustomers, useCustomerUsage, useGpus, useServers, useVgpus } from '@/hooks/queries'
import { customerStats, tr } from '@/lib/customers'
import { useFmt } from '@/lib/format'
import { useSettings } from '@/lib/settings'
import { loadColor } from '@/lib/status'
import { sum } from '@/lib/utils'

/** Only http(s) links are made clickable (data may come from a backend). A bare domain gets https://; other schemes (javascript:, data:…) are refused. */
export const safeHref = (u: string) => (/^https?:\/\//i.test(u) ? u : /^[a-z][a-z0-9+.-]*:/i.test(u) ? undefined : `https://${u}`)
const PLAN_COLOR = { Standard: 'blue', Business: 'geekblue', Enterprise: 'purple', Trial: 'default' } as const

function InfoRow({ k, children }: { k: string; children: ReactNode }) {
  const { t } = useTranslation()
  return <><dt className="text-muted-foreground">{t(k)}</dt><dd className="min-w-0 break-words">{children}</dd></>
}
function CopyButton({ text }: { text: string }) {
  const { t } = useTranslation(), [done, setDone] = useState(false)
  const copy = async () => {
    if (!navigator.clipboard) return
    try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1500) } catch { /* clipboard blocked */ }
  }
  return <Button onClick={copy}>{done ? t('cdCopied') : t('cdCopy')}</Button>
}

interface Row { key: string; kind: 'ded' | 'vgt'; name: string; gpuId: string; host: string; gb: number; used: number | null; util: number | null; status: Status }

/** Full page for one customer: /customers/:id */
export default function CustomerDetail() {
  const { id } = useParams(), nav = useNavigate(), { t } = useTranslation(), f = useFmt(), { lang } = useSettings()
  const cq = useCustomers(), gq = useGpus(), vq = useVgpus(), sq = useServers(), aq = useAlerts(), uq = useCustomerUsage(id ?? null)
  const gpus = gq.data ?? [], vgpus = vq.data ?? [], servers = sq.data ?? []
  const c = (cq.data ?? []).find((x) => x.id === id)
  const s = c ? customerStats(c, gpus, vgpus) : undefined
  const host = (sid: string) => servers.find((x) => x.id === sid)?.host ?? ''
  const back = <Button onClick={() => nav('/customers')}><ArrowLeft size={16} className="rtl:rotate-180" />{t('back')}</Button>
  return (
    <div className="flex flex-col gap-4">
      <div>{back}</div>
      <Guard queries={[cq, gq, vq, sq, aq]}>
        {!c || !s ? <Alert type="warning" showIcon message={t('notFound')} /> : (() => {
          const rows: Row[] = [
            ...s.gpus.map((g): Row => ({ key: g.id, kind: 'ded', name: g.name.replace('NVIDIA ', ''), gpuId: g.id, host: host(g.serverId), gb: g.memTotalGb, used: g.offline ? null : g.memUsedGb, util: g.offline ? null : g.util, status: g.status })),
            ...s.vgpus.map((v): Row => { const g = gpus.find((x) => x.id === v.gpuId); return { key: v.id, kind: 'vgt', name: `${v.vm} · ${v.profile}`, gpuId: v.gpuId, host: host(g?.serverId ?? ''), gb: v.allocGb, used: v.usedGb, util: v.running ? v.util : null, status: v.health } }),
          ]
          const serverIds = new Set([...s.gpus.map((g) => g.serverId), ...s.vgpus.map((v) => gpus.find((g) => g.id === v.gpuId)?.serverId ?? '')])
          const used = servers.filter((x) => serverIds.has(x.id))
          const alerts = (aq.data ?? []).filter((a) => serverIds.has(a.serverId))
          const pct = s.allocGb ? (s.usedGb / s.allocGb) * 100 : 0
          const dedGb = sum(s.gpus.map((g) => g.memTotalGb)), vgGb = sum(s.vgpus.map((v) => v.allocGb))
          const name = lang === 'fa' ? c.nameFa : c.name
          const na = f.n(null), sep = lang === 'fa' ? '، ' : ', '
          // ── EDIT HERE: columns of this customer's resource table ──
          const cols: Col<Row>[] = [
            { key: 'type', header: 'type', cell: (r) => t(r.kind === 'ded' ? 'ded' : 'vgt'), sort: (r) => r.kind },
            { key: 'name', header: 'name', cell: (r) => <span className="ltr">{r.name}</span>, sort: (r) => r.name },
            { key: 'host', header: 'host', cell: (r) => <span className="ltr">{r.host}</span>, sort: (r) => r.host },
            { key: 'gb', header: 'allocGb', cell: (r) => `${f.n(r.gb, 0)} GB`, sort: (r) => r.gb },
            { key: 'used', header: 'usedGb', cell: (r) => (r.used == null ? f.n(null) : `${f.n(r.used)} GB`), sort: (r) => r.used },
            { key: 'util', header: 'util', cell: (r) => (r.util == null ? f.n(null) : f.n(r.util, 0) + '%'), sort: (r) => r.util },
            { key: 'status', header: 'status', cell: (r) => <StatusBadge status={r.status} />, sort: (r) => r.status },
          ]
          return (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold">{name}</h1><StatusBadge status={s.status} />
                {s.util < 20 && <Tag color="warning">{t('underused')}</Tag>}
                <span className="text-sm text-muted-foreground">{t('since')} <span className="ltr">{c.since}</span></span>
              </div>
              <div className="grid gap-4 lg:grid-cols-3">
                <Card><CardTitle>{t('cdContact')}</CardTitle>
                  <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                    <InfoRow k="cdContactName">{tr(c.contactName, lang) || na}</InfoRow>
                    <InfoRow k="cdPhone">{c.phone ? <a className="ltr" href={`tel:${c.phone.replace(/[^\d+]/g, '')}`}>{c.phone}</a> : na}</InfoRow>
                    <InfoRow k="cdMobile">{c.mobile ? <a className="ltr" href={`tel:${c.mobile.replace(/[^\d+]/g, '')}`}>{c.mobile}</a> : na}</InfoRow>
                    <InfoRow k="cdEmail">{/^[^\s@]+@[^\s@]+$/.test(c.email) ? <a className="ltr" href={`mailto:${c.email}`}>{c.email}</a> : c.email || na}</InfoRow>
                    <InfoRow k="cdWebsite">{c.website && safeHref(c.website) ? <a className="ltr" href={safeHref(c.website)} target="_blank" rel="noopener noreferrer">{c.website.replace(/^https?:\/\//i, '')}</a> : c.website || na}</InfoRow>
                  </dl>
                </Card>
                <Card><CardTitle>{t('cdAddress')}</CardTitle>
                  <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                    <InfoRow k="cdStreet">{tr(c.address.street, lang) || na}</InfoRow>
                    <InfoRow k="cdCity">{tr(c.address.city, lang) || na}</InfoRow>
                    <InfoRow k="cdProvince">{tr(c.address.province, lang) || na}</InfoRow>
                    <InfoRow k="cdCountry">{tr(c.address.country, lang) || na}</InfoRow>
                    <InfoRow k="cdPostal">{c.address.postalCode ? <span className="ltr">{c.address.postalCode}</span> : na}</InfoRow>
                  </dl>
                  <div className="mt-3"><CopyButton text={[tr(c.address.street, lang), [tr(c.address.city, lang), tr(c.address.province, lang)].filter(Boolean).join(sep), c.address.postalCode, tr(c.address.country, lang)].filter(Boolean).join(sep)} /></div>
                </Card>
                <Card><CardTitle>{t('cdAccount')}</CardTitle>
                  <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                    <InfoRow k="cdIndustry">{tr(c.industry, lang) || na}</InfoRow>
                    <InfoRow k="cdPlan"><Tag color={PLAN_COLOR[c.plan] ?? 'default'} style={{ margin: 0 }}>{t('plan_' + c.plan)}</Tag></InfoRow>
                    <InfoRow k="cdContractEnd">{c.contractEnd ? <span className="ltr">{c.contractEnd}</span> : na}</InfoRow>
                    <InfoRow k="cdManager">{tr(c.accountManager, lang) || na}</InfoRow>
                    <InfoRow k="cdRegNo">{c.registrationNo ? <span className="ltr">{c.registrationNo}</span> : na}</InfoRow>
                    <InfoRow k="cdTaxId">{c.taxId ? <span className="ltr">{c.taxId}</span> : na}</InfoRow>
                  </dl>
                  {c.notes && tr(c.notes, lang) && <p className="mt-3 text-sm text-muted-foreground"><b className="text-foreground">{t('cdNotes')}: </b>{tr(c.notes, lang)}</p>}
                </Card>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
                <MetricCard label={t('dedGpu')} value={f.n(s.gpus.length, 0)} />
                <MetricCard label={t('vg')} value={f.n(s.vgpus.length, 0)} />
                <MetricCard label={t('allocGb')} value={`${f.n(s.allocGb, 0)} GB`} />
                <MetricCard label={t('usedGb')} value={`${f.n(s.usedGb)} GB`} />
                <MetricCard label={t('avgUtil')} value={f.n(s.util, 0) + '%'} status={s.util < 20 ? 'warn' : 'ok'} />
                <MetricCard label={t('hrs')} value={f.n(c.gpuHours, 0)} />
              </div>
              <div className="grid gap-4 lg:grid-cols-3">
                <Card className="lg:col-span-2"><CardTitle>{t('usage30')}</CardTitle>
                  <TimeChart data={(uq.data ?? []) as unknown as Record<string, number>[]} unit="%" max={100} series={[{ key: 'util', name: t('avgUtil'), color: '#4cb8e0' }]} /></Card>
                <Card><CardTitle>{t('custMem')}</CardTitle>
                  <Progress percent={Math.round(pct)} strokeColor={loadColor(pct)} format={(p) => f.n(p ?? 0, 0) + '%'} />
                  <dl className="mt-3 grid grid-cols-[1fr_auto] gap-y-1 text-sm">
                    <dt className="text-muted-foreground">{t('dedMem')}</dt><dd>{f.n(dedGb, 0)} GB</dd>
                    <dt className="text-muted-foreground">{t('vgMem')}</dt><dd>{f.n(vgGb, 0)} GB</dd>
                    <dt className="text-muted-foreground">{t('allocGb')}</dt><dd>{f.n(s.allocGb, 0)} GB</dd>
                    <dt className="text-muted-foreground">{t('usedGb')}</dt><dd>{f.n(s.usedGb)} GB</dd>
                  </dl>
                  <div className="mt-3 text-xs text-muted-foreground">{t('custServers')}</div>
                  <div className="mt-1 flex flex-wrap gap-1">{used.map((x) => <Tag key={x.id} style={{ margin: 0 }}><span className="ltr">{x.host}</span></Tag>)}</div>
                </Card>
              </div>
              <div><CardTitle>{t('res')}</CardTitle>
                <DataTable rows={rows} cols={cols} rowKey={(r) => r.key} status={(r) => r.status} search={(r) => `${r.name} ${r.host}`} onRow={(r) => nav(`/gpus/${r.gpuId}`)} /></div>
              <Card><CardTitle>{t('custAlerts')}</CardTitle><AlertList alerts={alerts} /></Card>
            </>
          )
        })()}
      </Guard>
    </div>
  )
}
