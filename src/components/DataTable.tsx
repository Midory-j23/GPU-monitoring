import { Button, Input, Select, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useMemo, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { Status } from '@/api/types'
import { Card } from './ui/card'

/** Column config: add an entry to show another field. `sort` makes the header sortable. */
export interface Col<T> { key: string; header: string; cell: (r: T) => ReactNode; sort?: (r: T) => number | string | null }

interface Props<T> {
  rows: T[]; cols: Col<T>[]; rowKey: (r: T) => string
  onRow?: (r: T) => void; search?: (r: T) => string; status?: (r: T) => Status
}
export function DataTable<T extends object>({ rows, cols, rowKey, onRow, search, status }: Props<T>) {
  const { t } = useTranslation()
  const [q, setQ] = useState(''), [st, setSt] = useState('all')
  const data = useMemo(() => rows.filter((x) => (!search || search(x).toLowerCase().includes(q.toLowerCase())) && (!status || st === 'all' || status(x) === st)), [rows, q, st, search, status])
  const columns: ColumnsType<T> = cols.map((c) => ({
    key: c.key, title: t(c.header), render: (_: unknown, r: T) => c.cell(r),
    sorter: c.sort ? {
      compare: (a: T, b: T, order?: 'ascend' | 'descend' | null) => {
        const x = c.sort!(a), y = c.sort!(b)
        if (x == null || y == null) { // missing values (N/A) always sort last; antd flips the sign for "descend"
          if (x == null && y == null) return 0
          const last = x == null ? 1 : -1
          return order === 'ascend' ? last : -last
        }
        return x > y ? 1 : x < y ? -1 : 0
      },
    } : undefined,
  }))
  const filtered = q !== '' || st !== 'all'
  return (
    <Card>
      {(search || status) && (
        <div className="mb-3 flex flex-wrap gap-2">
          {search && <Input allowClear style={{ width: 220 }} placeholder={t('search')} aria-label={t('search')} value={q} onChange={(e) => setQ(e.target.value)} />}
          {status && <Select<string> style={{ minWidth: 150 }} value={st} onChange={setSt} aria-label={t('status')} options={['all', 'ok', 'warn', 'crit', 'na'].map((v) => ({ value: v, label: v === 'all' ? t('allSt') : t(v) }))} />}
          {filtered && <Button onClick={() => { setQ(''); setSt('all') }}>{t('clear')}</Button>}
        </div>
      )}
      <Table<T> size="small" columns={columns} dataSource={data} rowKey={rowKey} scroll={{ x: 'max-content' }}
        pagination={{ pageSize: 10, hideOnSinglePage: true, showSizeChanger: false }} locale={{ emptyText: t('noRes') }}
        onRow={(r) => ({ onClick: () => onRow?.(r), tabIndex: onRow ? 0 : undefined, onKeyDown: (e) => { if (e.key === 'Enter') onRow?.(r) }, style: { cursor: onRow ? 'pointer' : undefined } })} />
    </Card>
  )
}
