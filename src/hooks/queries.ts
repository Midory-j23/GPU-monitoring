import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'
import type { Alert } from '@/api/types'
import { useSettings } from '@/lib/settings'

/** Poll interval comes from the top-bar selector (0 = off). */
function useOpts() {
  const { refreshSec } = useSettings()
  return { refetchInterval: refreshSec ? refreshSec * 1000 : (false as const), placeholderData: <T,>(p: T | undefined) => p }
}
export const useServers = () => useQuery({ queryKey: ['servers'], queryFn: api.servers, ...useOpts() })
export const useGpus = () => useQuery({ queryKey: ['gpus'], queryFn: api.gpus, ...useOpts() })
export const useVgpus = () => useQuery({ queryKey: ['vgpus'], queryFn: api.vgpus, ...useOpts() })
export const useCustomers = () => useQuery({ queryKey: ['customers'], queryFn: api.customers, ...useOpts() })
export const useAlerts = () => useQuery({ queryKey: ['alerts'], queryFn: api.alerts, ...useOpts() })
export const useOverview = () => useQuery({ queryKey: ['overview'], queryFn: api.overview, ...useOpts() })
export const useGpuMetrics = (id: string | null) =>
  useQuery({ queryKey: ['gpu-metrics', id], queryFn: () => api.gpuMetrics(id as string), enabled: !!id, ...useOpts() })

export const useCustomerUsage = (id: string | null) =>
  useQuery({ queryKey: ['customer-usage', id], queryFn: () => api.customerUsage(id as string), enabled: !!id, ...useOpts() })

/** Acknowledge alerts with an optimistic cache update. */
export function useAcknowledge() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (ids: number[]) => api.acknowledge(ids),
    onMutate: async (ids) => {
      await qc.cancelQueries({ queryKey: ['alerts'] })
      const prev = qc.getQueryData<Alert[]>(['alerts'])
      qc.setQueryData<Alert[]>(['alerts'], (a) => a?.map((x) => (ids.includes(x.id) ? { ...x, acked: true } : x)))
      return { prev }
    },
    onError: (_e, _ids, ctx) => ctx?.prev && qc.setQueryData(['alerts'], ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: ['alerts'] }),
  })
}
