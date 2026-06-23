import { Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout'
import { ProtectedRoute, RoleRoute } from './ProtectedRoute'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import AccountStatePage from '../pages/AccountStatePage'
import DashboardPage from '../pages/DashboardPage'
import BookingListPage from '../pages/BookingListPage'
import UserManagementPage from '../pages/UserManagementPage'
import BranchManagementPage from '../pages/BranchManagementPage'
import DevPreviewPage from '../pages/DevPreviewPage'

export default function AppRoutes() {
  return <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/pending-approval" element={<AccountStatePage />} />
    <Route path="/blocked" element={<AccountStatePage blocked />} />
    {import.meta.env.DEV && <Route path="/ui-preview" element={<DevPreviewPage />} />}
    <Route element={<ProtectedRoute />}><Route element={<MainLayout />}>
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/resources" element={<Navigate to="/dashboard" replace />} />
      <Route path="/bookings" element={<BookingListPage />} />
      <Route element={<RoleRoute roles={['admin']} />}>
        <Route path="/users" element={<UserManagementPage />} />
        <Route path="/branches" element={<BranchManagementPage />} />
      </Route>
    </Route></Route>
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
}
