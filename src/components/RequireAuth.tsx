import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/lib/auth'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user } = useAuth(), loc = useLocation()
  return user ? <>{children}</> : <Navigate to="/login" replace state={{ from: loc.pathname + loc.search }} />
}
