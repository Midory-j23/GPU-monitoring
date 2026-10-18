import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Status } from '@/api/types'
import { AllocPanel } from '@/components/AllocPanel'
import { Guard } from '@/components/Guard'
import { MetricCard } from '@/components/MetricCard'
import { Page } from '@/components/Page'
import { AlertList } from '@/pages/Alerts'
import { StatusBadge } from '@/components/StatusBadge'
import { TimeChart } from '@/components/TimeChart'
import { Card, CardTitle } from '@/components/ui/card'
import { useAlerts, useGpus, useOverview, useServers, useVgpus } from '@/hooks/queries'
import { useFmt } from '@/lib/format'
import { useSettings } from '@/lib/settings'
import { loadColor, STATUS_COLOR } from '@/lib/status'
import { sum } from '@/lib/utils'

const Bar = ({ label, v, text }: { label: string; v: number; text: string }) => (
  <div className="my-1 flex items-center gap-2 text-xs">
    <span className="w-28 text-muted-foreground">{label}</span>
    <div className="h-2 flex-1 overflow-hidden rounded bg-muted"><div className="h-full" style={{ width: `${Math.min(100, v)}%`, background: loadColor(v) }} /></div>
    <span className="w-16 text-end">{text}</span>
  </div>
)

export default function Overview() {
  const { t } = useTranslation(), f = useFmt(), nav = useNavigate(), { serverId } = useSettings()
  const gq = useGpus(), vq = useVgpus(), aq = useAlerts(), sq = useServers(), oq = useOverview()
  const scoped = (id: string) => serverId === 'all' || id === serverId
  const gpus = (gq.data ?? []).filter((g) => scoped(g.serverId)), on = gpus.filter((g) => !g.offline)
  const vgpus = (vq.data ?? []).filter((v) => gpus.some((g) => g.id === v.gpuId))
  const servers = (sq.data ?? []).filter((s) => scoped(s.id)), open = (aq.data ?? []).filter((a) => !a.acked && scoped(a.serverId))
  const avg = (fn: (g: (typeof on)[number]) => number) => (on.length ? sum(on.map(fn)) / on.length : 0)
  const util = avg((g) => g.util), temp = avg((g) => g.temp), power = sum(on.map((g) => g.powerW))
  const cap = sum(on.map((g) => g.memTotalGb)), mem = cap ? (sum(on.map((g) => g.memUsedGb)) / cap) * 100 : 0
  const series = oq.data ?? [], sp = (k: 'util' | 'mem' | 'temp' | 'power') => series.map((p) => p[k])
  const cards: { k: string; v: string; s?: Status; tip?: string; spark?: number[]; sub?: string }[] = [
    { k: 'total', v: f.n(gpus.length, 0), sub: `${f.n(servers.length, 0)} ${t('srvN')}` },
    { k: 'active', v: f.n(on.length, 0), s: on.length < gpus.length ? 'warn' : 'ok', sub: `${f.n(gpus.length - on.length, 0)} ${t('na')}` },
    { k: 'vg', v: f.n(vgpus.length, 0), tip: 'vgTip', sub: `${f.n(vgpus.filter((v) => v.running).length, 0)} ${t('run')}` },
    { k: 'util', v: f.n(util, 0) + '%', s: util > 85 ? 'warn' : 'ok', tip: 'utilTip', spark: sp('util') },
    { k: 'mem', v: f.n(mem, 0) + '%', tip: 'memTip', spark: sp('mem') },
    { k: 'temp', v: f.n(temp, 0) + ' °C', s: temp > 78 ? 'warn' : 'ok', tip: 'tempTip', spark: sp('temp') },
    { k: 'power', v: f.n(power / 1000, 2) + ' kW', tip: 'powerTip', spark: sp('power') },
    { k: 'alN', v: f.n(open.length, 0), s: open.some((a) => a.severity === 'crit') ? 'crit' : open.length ? 'warn' : 'ok', tip: 'alNTip', sub: `${f.n(open.filter((a) => a.severity === 'crit').length, 0)} ${t('crit')}` },
    { k: 'srvN', v: f.n(servers.length, 0), s: servers.some((s) => !s.online) ? 'warn' : 'ok', sub: `${f.n(servers.filter((s) => !s.online).length, 0)} ${t('offline')}` },
  ]
  const health = (['ok', 'warn', 'crit', 'na'] as Status[]).map((k) => ({ k, v: gpus.filter((g) => g.status === k).length }))
  const charts = [
    { id: 'cUtil', series: [{ key: 'util', name: t('util'), color: '#4cb8e0' }], unit: '%', max: 100 },
    { id: 'cMem', series: [{ key: 'mem', name: t('mem'), color: '#f0b429' }], unit: '%', max: 100 },
    { id: 'cTemp', series: [{ key: 'temp', name: t('temp'), color: '#ff6b60' }], unit: '°C', max: 100 },
    { id: 'cPow', series: [{ key: 'power', name: t('power'), color: '#3ccf8e' }], unit: 'W', max: undefined },
  ]
  return (
    <Page id="overview">
      <Guard queries={[gq, vq, aq, sq, oq]}>
        <Card>
          <CardTitle>{t('rack')}</CardTitle>
          <div className="flex flex-wrap gap-4">
            {servers.map((s) => (
              <div key={s.id}><b className="ltr text-xs text-muted-foreground">{s.host}</b>
                <div className="mt-1 flex gap-1">
                  {gpus.filter((g) => g.serverId === s.id).map((g) => (
                    <button key={g.id} onClick={() => nav(`/gpus/${g.id}`)} title={`${g.name} ${f.n(g.util, 0)}%`} className="flex h-11 w-8 items-end justify-center rounded pb-0.5 text-[10px] font-bold text-white" style={{ background: g.offline ? STATUS_COLOR.na : loadColor(g.util) }}>
                      {g.offline ? '–' : f.n(g.util, 0)}
                    </button>))}
                </div>
              </div>))}
          </div>
        </Card>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 2xl:grid-cols-9 [&>*:last-child]:col-span-2 sm:[&>*:last-child]:col-span-1">
          {cards.map((c) => <MetricCard key={c.k} label={t(c.k)} value={c.v} status={c.s} tip={c.tip ? t(c.tip) : undefined} spark={c.spark} sub={c.sub} />)}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {charts.map((c) => <Card key={c.id}><CardTitle>{t(c.id)}</CardTitle><TimeChart data={series} series={c.series} unit={c.unit} max={c.max} /></Card>)}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardTitle>{t('fleetH')}</CardTitle>
            <div className="flex flex-wrap items-center gap-4">
              <div dir="ltr" className="relative h-32 w-32">
                <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={health} dataKey="v" innerRadius={38} outerRadius={56} stroke="none" isAnimationActive={false}>{health.map((h) => <Cell key={h.k} fill={STATUS_COLOR[h.k]} />)}</Pie></PieChart></ResponsiveContainer>
                <span className="absolute inset-0 flex items-center justify-center text-xl font-bold">{f.n(gpus.length, 0)}</span>
              </div>
              <div className="space-y-1">{health.map((h) => <div key={h.k}><StatusBadge status={h.k} /> <b>{f.n(h.v, 0)}</b></div>)}</div>
            </div>
          </Card>
          <Card>
            <CardTitle>{t('srvLoad')}</CardTitle>
            {servers.map((s) => {
              const a = on.filter((g) => g.serverId === s.id), n = a.length || 1
              const u = sum(a.map((g) => g.util)) / n, m = (sum(a.map((g) => g.memUsedGb)) / (sum(a.map((g) => g.memTotalGb)) || 1)) * 100
              const w = sum(a.map((g) => g.powerW)), pl = sum(a.map((g) => g.powerLimitW)) || 1, mt = Math.max(0, ...a.map((g) => g.temp))
              return (
                <div key={s.id} className="mb-3"><b className="ltr text-sm">{s.host}</b>
                  {a.length ? <><Bar label={t('util')} v={u} text={f.n(u, 0) + '%'} /><Bar label={t('mem')} v={m} text={f.n(m, 0) + '%'} /><Bar label={t('power')} v={(w / pl) * 100} text={f.n(w, 0) + ' W'} /><Bar label={t('maxT')} v={mt} text={f.n(mt, 0) + ' °C'} /></> : <div className="text-xs text-muted-foreground">{t('unsup')}</div>}
                </div>)
            })}
          </Card>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <AllocPanel gpus={gpus} vgpus={vgpus} />
          <div className="flex flex-col gap-4">
            <Card>
              <CardTitle>{t('top')}</CardTitle>
              {[...on].sort((a, b) => b.util - a.util).slice(0, 5).map((g) => <Bar key={g.id} label={g.name.replace('NVIDIA ', '')} v={g.util} text={f.n(g.util, 0) + '%'} />)}
            </Card>
            <Card><CardTitle>{t('recent')}</CardTitle><AlertList alerts={(aq.data ?? []).filter((a) => scoped(a.serverId)).slice(0, 3)} /></Card>
          </div>
        </div>
      </Guard>
    </Page>
  )
}
