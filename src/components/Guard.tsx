import { Alert, Skeleton } from 'antd'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { UseQueryResult } from '@tanstack/react-query'
import { Button } from './ui/button'

/** Shows skeleton / error / content for one or more queries. */
export function Guard({ queries, children }: { queries: UseQueryResult<unknown>[]; children: ReactNode }) {
  const { t } = useTranslation()
  if (queries.some((q) => q.isError))
    return <Alert type="error" showIcon message={t('error')} action={<Button onClick={() => queries.forEach((q) => q.refetch())}>{t('retry')}</Button>} />
  if (queries.some((q) => q.isLoading))
    return <div data-loading aria-busy="true" className="glass rounded-xl p-4"><Skeleton active paragraph={{ rows: 5 }} /><span className="sr-only">{t('loading')}</span></div>
  return <>{children}</>
}
