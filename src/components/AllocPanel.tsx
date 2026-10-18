import { useTranslation } from 'react-i18next'
import type { Gpu, Vgpu } from '@/api/types'
import { useFmt } from '@/lib/format'
import { sum } from '@/lib/utils'
import { Card, CardTitle } from './ui/card'
const PALETTE = ['#4cb8e0', '#8b7cf0', '#e08a4c', '#3ccf8e', '#d96fa8']

/** Allocated vGPU memory per physical GPU. The tick marks physical memory in use (a different measurement). */
export function AllocPanel({ gpus, vgpus }: { gpus: Gpu[]; vgpus: Vgpu[] }) {
  const { t } = useTranslation(), f = useFmt()
  return (
    <Card>
      <CardTitle>{t('alloc')}</CardTitle>
      {gpus.filter((g) => vgpus.some((v) => v.gpuId === g.id)).map((g) => {
        const vs = vgpus.filter((v) => v.gpuId === g.id)
        return (
          <div key={g.id} className="mb-3">
            <div className="mb-1 text-xs text-muted-foreground">{g.name} · <span className="ltr">{g.pci}</span> — {f.n(sum(vs.map((v) => v.allocGb)), 0)} / {f.n(g.memTotalGb, 0)} GB</div>
            <div dir="ltr" className="relative flex h-5 overflow-hidden rounded bg-muted">
              {vs.map((v, i) => (
                <span key={v.id} title={v.vm} style={{ width: `${(v.allocGb / g.memTotalGb) * 100}%`, background: PALETTE[i % 5] }} className="flex items-center justify-center overflow-hidden border-e-2 border-background text-[10px] text-white">{v.profile}</span>
              ))}
              <b className="absolute inset-y-0 w-0.5 bg-foreground" style={{ left: `${(g.memUsedGb / g.memTotalGb) * 100}%` }} />
            </div>
          </div>
        )
      })}
      <p className="text-xs text-muted-foreground">{t('allocNote')}</p>
    </Card>
  )
}
