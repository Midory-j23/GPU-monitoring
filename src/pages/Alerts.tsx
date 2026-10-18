import { Select } from 'antd'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Alert } from '@/api/types'
import { Guard } from '@/components/Guard'
import { Page } from '@/components/Page'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAcknowledge, useAlerts, useServers } from '@/hooks/queries'
import { useAuth } from '@/lib/auth'
import { useFmt } from '@/lib/format'
import { useSettings } from '@/lib/settings'
import { cn } from '@/lib/utils'

export function AlertList({ alerts }: { alerts: Alert[] }) {
  const { t } = useTranslation(), f = useFmt(), { lang } = useSettings(), ack = useAcknowledge(), { canAck } = useAuth()
  const servers = useServers().data ?? []
  return (
    <div>
      {alerts.length === 0 && <p className="text-sm text-muted-foreground">{t('noRes')}</p>}
      {alerts.map((a) => (
        <div key={a.id} className="flex items-start gap-2 border-b border-border py-2 last:border-0">
          <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', a.severity === 'crit' ? 'bg-crit' : 'bg-warn')} aria-label={t(a.severity)} />
          <div className="flex-1 text-sm">{lang === 'fa' ? a.fa : a.en}
            <div className="text-xs text-muted-foreground"><span className="ltr">{servers.find((s) => s.id === a.serverId)?.host}{a.gpuIndex != null ? ` / GPU ${a.gpuIndex}` : ''}</span> · {f.time(Date.now() - a.minutesAgo * 60000)}</div>
          </div>
          {a.acked ? <span className="text-xs text-muted-foreground">{t('acked')}</span> : !canAck ? null : <Button onClick={() => ack.mutate([a.id])}>{t('ack')}</Button>}
        </div>))}
    </div>
  )
}

export default function Alerts() {
  const { t } = useTranslation(), { serverId } = useSettings(), q = useAlerts(), ack = useAcknowledge(), { canAck } = useAuth()
  const [filter, setFilter] = useState('all')
  const list = (q.data ?? []).filter((a) => (serverId === 'all' || a.serverId === serverId) && (filter === 'all' || !a.acked))
  return (
    <Page id="alerts">
      <Guard queries={[q]}>
        <div className="flex gap-2">
          {canAck && <Button onClick={() => ack.mutate(list.filter((a) => !a.acked).map((a) => a.id))}>{t('ackAll')}</Button>}
          <Select<string> style={{ minWidth: 130 }} value={filter} onChange={setFilter} aria-label={t('status')} options={[{ value: 'all', label: t('all') }, { value: 'open', label: t('open') }]} />
        </div>
        <Card><AlertList alerts={list} /></Card>
      </Guard>
    </Page>
  )
}
