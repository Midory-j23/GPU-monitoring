import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api } from '@/api/client'

export type Role = 'admin' | 'operator' | 'viewer'
export interface User { username: string; role: Role }
interface Auth { user: User | null; login: (u: string, p: string) => Promise<void>; logout: () => void; canAck: boolean }

const KEY = 'auth'
const Ctx = createContext<Auth | null>(null)
const clearSaved = () => { try { sessionStorage.removeItem(KEY) } catch { /* ignore */ } }

/**
 * UI session state only. The real session is an HTTP-only cookie set by the backend;
 * permissions must be enforced by the backend — hiding buttons here is just a courtesy.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try { const v = sessionStorage.getItem(KEY); return v ? (JSON.parse(v) as User) : null } catch { return null }
  })
  useEffect(() => {
    const expired = () => { setUser(null); clearSaved() } // any API 401 signs the user out
    window.addEventListener('auth:expired', expired)
    return () => window.removeEventListener('auth:expired', expired)
  }, [])
  const v = useMemo<Auth>(() => ({
    user,
    canAck: user?.role === 'admin' || user?.role === 'operator',
    login: async (u, p) => {
      const x = await api.login(u, p)
      setUser(x)
      try { sessionStorage.setItem(KEY, JSON.stringify(x)) } catch { /* ignore */ }
    },
    logout: () => { api.logout().catch(() => undefined); setUser(null); clearSaved() },
  }), [user])
  return <Ctx.Provider value={v}>{children}</Ctx.Provider>
}
export function useAuth() {
  const c = useContext(Ctx)
  if (!c) throw new Error('AuthProvider missing')
  return c
}
