import { Alert } from 'antd'
import { ArrowLeft } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Vgpu } from '@/api/types'
import { AllocPanel } from '@/components/AllocPanel'
import { DataTable, type Col } from '@/components/DataTable'
import { Gauge } from '@/components/Gauge'
import { Guard } from '@/components/Guard'
import { MetricCard } from '@/components/MetricCard'
import { StatusBadge } from '@/components/StatusBadge'
import { TimeChart } from '@/components/TimeChart'
import { Button } from '@/components/ui/button'
import { Card, CardTitle } from '@/components/ui/card'
import { Table, TD, TH } from '@/components/ui/table'
import { AlertList } from '@/pages/Alerts'
import { gpuDetails, procs, type Ctx } from '@/pages/Gpus'
import { useAlerts, useCustomers, useGpuMetrics, useGpus, useServers, useVgpus } from '@/hooks/queries'
import { useFmt } from '@/lib/format'
import { useSettings } from '@/lib/settings'
import { loadColor } from '@/lib/status'

/** Full page for one physical GPU: /gpus/:id */
export default function GpuDetail() {
  const { id } = useParams(), nav = useNavigate(), { t } = useTranslation(), f = useFmt(), { lang } = useSettings()
  const gq = useGpus(), sq = useServers(), vq = useVgpus(), cq = useCustomers(), aq = useAlerts(), mq = useGpuMetrics(id ?? null)
  const servers = sq.data ?? [], customers = cq.data ?? [], g = (gq.data ?? []).find((x) => x.id === id)
  const cname = (cid: string) => { const c = customers.find((x) => x.id === cid); return c ? (lang === 'fa' ? c.nameFa : c.name) : '' }
  const ctx: Ctx = { f, t, lang, server: (sid) => servers.find((s) => s.id === sid), owners: () => '' }
  return (
    <div className="flex flex-col gap-4">
      <div><Button onClick={() => nav('/gpus')}><ArrowLeft size={16} className="rtl:rotate-180" />{t('backGpus')}</Button></div>
      <Guard queries={[gq, sq, vq, cq, aq]}>
        {!g ? <Alert type="warning" showIcon message={t('gpuNotFound')} /> : (() => {
          const host = ctx.server(g.serverId), vgs = (vq.data ?? []).filter((v) => v.gpuId === g.id), series = mq.data ?? []
          const memPct = (g.memUsedGb / g.memTotalGb) * 100, pwPct = (g.powerW / g.powerLimitW) * 100
          const alerts = (aq.data ?? []).filter((a) => a.serverId === g.serverId && (a.gpuIndex === g.index || a.gpuIndex === null))
          const tempColor = g.temp >= 85 ? 'hsl(var(--crit))' : g.temp >= 78 ? 'hsl(var(--warn))' : 'hsl(var(--ok))'
          const sp = (k: 'util' | 'mem' | 'temp' | 'power') => (series.length ? series.map((p) => p[k]) : undefined)
          const na = f.n(null)
          const owners = [...new Set(vgs.map((v) => v.customerId))]
          // ── EDIT HERE: columns of the vGPU table on this page ──
          const cols: Col<Vgpu>[] = [
            { key: 'vm', header: 'vm', cell: (v) => <span className="ltr">{v.vm}</span>, sort: (v) => v.vm },
            { key: 'cust', header: 'cust', cell: (v) => cname(v.customerId), sort: (v) => cname(v.customerId) },
            { key: 'prof', header: 'prof', cell: (v) => <span className="ltr">{v.profile}</span>, sort: (v) => v.profile },
            { key: 'alloc', header: 'allocFb', cell: (v) => `${f.n(v.allocGb, 0)} GB`, sort: (v) => v.allocGb },
            { key: 'guest', header: 'guestFb', cell: (v) => (v.usedGb == null ? na : `${f.n(v.usedGb)} GB`), sort: (v) => v.usedGb },
            { key: 'util', header: 'vutil', cell: (v) => (v.running ? f.n(v.util, 0) + '%' : na), sort: (v) => (v.running ? v.util : null) },
            { key: 'pw', header: 'pw', cell: (v) => t(v.running ? 'run' : 'stop'), sort: (v) => Number(v.running) },
            { key: 'health', header: 'health', cell: (v) => <StatusBadge status={v.health} />, sort: (v) => v.health },
          ]
          const charts = [
            { id: 'cUtil', key: 'util', name: t('util'), color: '#4cb8e0', unit: '%', max: 100 }, { id: 'cMem', key: 'mem', name: t('mem'), color: '#f0b429', unit: '%', max: 100 },
            { id: 'cTemp', key: 'temp', name: t('temp'), color: '#ff6b60', unit: '°C', max: 100 }, { id: 'cPow', key: 'power', name: t('power'), color: '#3ccf8e', unit: 'W', max: g.powerLimitW },
          ]
          return (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold">{g.name}</h1><StatusBadge status={g.status} />
                <span className="text-sm text-muted-foreground"><span className="ltr">{host?.host}</span> · GPU <span className="ltr">#{g.index}</span> · <span className="ltr">{g.pci}</span></span>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
                <MetricCard label={t('util')} value={g.offline ? na : f.n(g.util, 0) + '%'} status={g.status} spark={g.offline ? undefined : sp('util')} sub="" />
                <MetricCard label={t('mem')} value={g.offline ? na : f.n(memPct, 0) + '%'} spark={g.offline ? undefined : sp('mem')} sub="" />
                <MetricCard label={t('temp')} value={g.offline ? na : f.n(g.temp, 0) + ' °C'} status={g.temp >= 85 ? 'crit' : g.temp >= 78 ? 'warn' : 'ok'} spark={g.offline ? undefined : sp('temp')} sub="" />
                <MetricCard label={t('power')} value={g.offline ? na : f.n(g.powerW, 0) + ' W'} spark={g.offline ? undefined : sp('power')} sub={`${t('plim')}: ${f.n(g.powerLimitW, 0)} W`} />
                <MetricCard label={t('fan')} value={g.offline || g.fanPct == null ? na : f.n(g.fanPct, 0) + '%'} sub="" />
                <MetricCard label={t('clk')} value={g.offline ? na : f.n(g.clockMhz, 0) + ' MHz'} sub="" />
              </div>
              <div className="grid gap-4 lg:grid-cols-3">
                <Card className="lg:col-span-2"><CardTitle>{t('gpuInfo')}</CardTitle>
                  <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-sm">
                    {gpuDetails.map((d) => <div key={d.k} className="contents"><dt className="text-muted-foreground">{t(d.k)}</dt><dd>{d.v(g, ctx)}</dd></div>)}
                  </dl>
                </Card>
                <Card><CardTitle>{t('gpuCustomers')}</CardTitle>
                  <div className="flex flex-col items-start gap-2">
                    {g.customerId && <Button onClick={() => nav(`/customers/${g.customerId}`)}>{cname(g.customerId)} · {t('dedicatedTo')}</Button>}
                    {owners.map((cid) => <Button key={cid} onClick={() => nav(`/customers/${cid}`)}>{cname(cid)} · {f.n(vgs.filter((v) => v.customerId === cid).length, 0)} vGPU</Button>)}
                    {!g.customerId && owners.length === 0 && <span className="text-sm text-muted-foreground">{t('noRes')}</span>}
                  </div>
                </Card>
              </div>
              {!g.offline && (
                <Card><div className="flex flex-wrap justify-around gap-3">
                  <Gauge value={g.util} label={t('util')} unit="%" color={loadColor(g.util)} /><Gauge value={memPct} label={t('mem')} unit="%" color={loadColor(memPct)} />
                  <Gauge value={g.temp} label={t('temp')} unit="°" color={tempColor} /><Gauge value={pwPct} label={t('power')} unit="%" color={loadColor(pwPct)} />
                </div></Card>
              )}
              <div className="grid gap-4 md:grid-cols-2">
                {charts.map((c) => (
                  <Card key={c.id}><CardTitle>{t(c.id)}</CardTitle>
                    {g.offline ? <p className="text-sm text-muted-foreground">{na}</p> : <TimeChart data={series} unit={c.unit} max={c.max} series={[{ key: c.key, name: c.name, color: c.color }]} />}
                  </Card>))}
              </div>
              <Card><CardTitle>{t('procs')}</CardTitle>
                <Table className="min-w-0"><thead><tr><TH>{t('name')}</TH><TH>{t('pid')}</TH><TH>{t('pmem')}</TH></tr></thead><tbody>
                  {procs(g, vgs).map(([n, p, mem]) => <tr key={n}><TD><span className="ltr">{n}</span></TD><TD>{typeof p === 'number' ? String(p) : p}</TD><TD>{f.n(mem)} GB</TD></tr>)}
                  {g.offline && <tr><TD colSpan={3}>{na}</TD></tr>}
                </tbody></Table>
              </Card>
              {vgs.length > 0 && <>
                <div><CardTitle>{t('gpuVgpus')}</CardTitle>
                  <DataTable rows={vgs} cols={cols} rowKey={(v) => v.id} status={(v) => v.health} search={(v) => `${v.vm} ${v.profile} ${cname(v.customerId)}`} onRow={(v) => nav(`/customers/${v.customerId}`)} /></div>
                <AllocPanel gpus={[g]} vgpus={vgs} />
              </>}
              <Card><CardTitle>{t('gpuAlerts')}</CardTitle><AlertList alerts={alerts} /></Card>
            </>
          )
        })()}
      </Guard>
    </div>
  )
}
