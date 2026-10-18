import { useTranslation } from 'react-i18next'
import { Guard } from '@/components/Guard'
import { Page } from '@/components/Page'
import { StatusBadge } from '@/components/StatusBadge'
import { Card, CardTitle } from '@/components/ui/card'
import { useGpus, useServers } from '@/hooks/queries'
import { useFmt } from '@/lib/format'
import { useSettings } from '@/lib/settings'

export default function Servers() {
  const { t } = useTranslation(), f = useFmt(), { serverId } = useSettings(), sq = useServers(), gq = useGpus()
  const list = (sq.data ?? []).filter((s) => serverId === 'all' || s.id === serverId)
  return (
    <Page id="servers">
      <Guard queries={[sq, gq]}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {list.map((s) => {
            const rows: [string, React.ReactNode][] = [
              ['ip', <span className="ltr">{s.ip}</span>], ['os', <span className="ltr">{s.os}</span>], ['drv', <span className="ltr">{s.driver}</span>],
              ['gpus', f.n((gq.data ?? []).filter((g) => g.serverId === s.id).length, 0)],
              ['agent', <StatusBadge status={s.online ? 'ok' : 'crit'} label={t(s.online ? 'online' : 'offline')} />],
              ['upd', f.time(Date.now() - s.lastSeenSec * 1000)],
            ]
            return (
              <Card key={s.id}>
                <CardTitle><span className="ltr">{s.host}</span></CardTitle>
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                  {rows.map(([k, v]) => <div key={k} className="contents"><dt className="text-muted-foreground">{t(k)}</dt><dd>{v}</dd></div>)}
                </dl>
              </Card>)
          })}
        </div>
      </Guard>
    </Page>
  )
}
