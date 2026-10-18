import { Alert, InputNumber, Switch } from 'antd'
import { useTranslation } from 'react-i18next'
import { Page } from '@/components/Page'
import { Button } from '@/components/ui/button'
import { Card, CardTitle } from '@/components/ui/card'
import { useFmt } from '@/lib/format'
import { useSettings } from '@/lib/settings'

const PRESETS = [1, 2, 5, 10, 30, 60]

export default function SettingsPage() {
  const { t } = useTranslation(), f = useFmt(), { refreshSec, setRefreshSec, animBg, setAnimBg } = useSettings()
  return (
    <Page id="settings">
      <Card className="max-w-xl">
        <div className="space-y-3">
          <CardTitle>{t('refreshTitle')}</CardTitle>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {t('every')}
            <InputNumber min={0} max={3600} precision={0} step={1} value={refreshSec} style={{ width: 110 }} onChange={(v) => v != null && setRefreshSec(v)} />
            {t('seconds')}
          </div>
          <div>
            <div className="mb-1 text-xs text-muted-foreground">{t('presets')}</div>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((n) => <Button key={n} variant={refreshSec === n ? 'default' : 'outline'} onClick={() => setRefreshSec(n)}>{f.n(n, 0)} {t('secShort')}</Button>)}
              <Button variant={refreshSec === 0 ? 'default' : 'outline'} onClick={() => setRefreshSec(0)}>{t('off')}</Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{t('refreshHint')}</p>
          {refreshSec > 0 && refreshSec < 5 && <div role="status"><Alert type="warning" showIcon message={t('fastWarn')} /></div>}
        </div>
      </Card>
      <Card className="max-w-xl">
        <div className="space-y-2">
          <CardTitle>{t('fxTitle')}</CardTitle>
          <div className="flex items-center gap-2 text-sm"><Switch checked={animBg} onChange={setAnimBg} aria-label={t('animBg')} />{t('animBg')}</div>
          <p className="text-xs text-muted-foreground">{t('fxHint')}</p>
        </div>
      </Card>
    </Page>
  )
}
