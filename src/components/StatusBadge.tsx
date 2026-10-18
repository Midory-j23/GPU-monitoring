import { Badge } from 'antd'
import { useTranslation } from 'react-i18next'
import type { Status } from '@/api/types'
const map = { ok: 'success', warn: 'warning', crit: 'error', na: 'default' } as const
export function StatusBadge({ status, label }: { status: Status; label?: string }) {
  const { t } = useTranslation()
  return <Badge status={map[status]} text={label ?? t(status)} />
}
