import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { Loading } from '../components/common/States'

export function ProtectedRoute() {
  const { isAuthenticated, isLoading, initialized } = useAuthStore()
  const location = useLocation()
  if (isLoading || !initialized) return <div className="fullscreen-state"><Loading label="Đang mở ca làm việc…" /></div>
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />
  return <Outlet />
}

export function RoleRoute({ roles }) {
  const user = useAuthStore((state) => state.user)
  return roles.includes(user?.role) ? <Outlet /> : <Navigate to="/dashboard" replace />
}
