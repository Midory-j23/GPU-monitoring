import { mock } from './mock'
import type { Alert, Customer, Gpu, Point, Server, Vgpu } from './types'

const useMock = import.meta.env.VITE_USE_MOCK !== 'false'
const base = (import.meta.env.VITE_API_URL as string | undefined) ?? ''
const wait = <T,>(v: T) => new Promise<T>((r) => setTimeout(() => r(v), 120))

async function call<T>(path: string, fromMock: () => T, init?: RequestInit): Promise<T> {
  if (useMock) return wait(fromMock())
  const res = await fetch(base + path, { credentials: 'include', ...init })
  if (res.status === 401) window.dispatchEvent(new Event('auth:expired'))
  if (!res.ok) throw new Error(`${res.status} ${path}`)
  return res.json() as Promise<T>
}

export interface SessionUser { username: string; role: 'admin' | 'operator' | 'viewer' }
const json = { 'Content-Type': 'application/json' }

/** Every endpoint the UI uses. Same paths as the FastAPI backend in the spec. */
export const api = {
  /** Real mode: POST /api/auth/login sets an HTTP-only session cookie and returns { username, role }. */
  login: (username: string, password: string): Promise<SessionUser> =>
    useMock
      ? new Promise((res, rej) => setTimeout(() => { const u = mock.login(username, password); u ? res(u) : rej(new Error('401')) }, 400))
      : fetch(base + '/api/auth/login', { method: 'POST', credentials: 'include', headers: json, body: JSON.stringify({ username, password }) })
          .then((r) => { if (!r.ok) throw new Error(String(r.status)); return r.json() as Promise<SessionUser> }),
  logout: (): Promise<void> => (useMock ? Promise.resolve() : fetch(base + '/api/auth/logout', { method: 'POST', credentials: 'include' }).then(() => undefined)),
  servers: () => call<Server[]>('/api/servers', mock.servers),
  gpus: () => call<Gpu[]>('/api/gpus', mock.gpus),
  vgpus: () => call<Vgpu[]>('/api/vgpus', mock.vgpus),
  customers: () => call<Customer[]>('/api/customers', mock.customers),
  alerts: () => call<Alert[]>('/api/alerts', mock.alerts),
  overview: () => call<Point[]>('/api/metrics/overview', mock.overview),
  gpuMetrics: (id: string) => call<Point[]>(`/api/gpus/${id}/metrics`, () => mock.gpuMetrics(id)),
  customerUsage: (id: string) => call<{ m: number; util: number }[]>(`/api/customers/${id}/usage`, () => mock.customerUsage(id)),
  acknowledge: (ids: number[]) =>
    call<void>('/api/alerts/acknowledge', () => mock.ack(ids), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids }) }),
}
