import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import Icon from '../common/Icon'

const baseNav = [
  { to: '/dashboard', label: 'Sơ đồ', icon: 'map' },
  { to: '/bookings', label: 'Lịch sử', icon: 'calendar' },
]
const adminNav = [
  { to: '/users', label: 'Nhân sự', icon: 'users', admin: true },
  { to: '/branches', label: 'Chi nhánh', icon: 'building', admin: true },
]

export default function MainLayout() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()
  const location = useLocation()
  const navItems = [...baseNav, ...(user?.role === 'admin' ? adminNav : [])]
  const pageName = navItems.find((item) => location.pathname.startsWith(item.to))?.label || 'DauOi'

  const handleLogout = async () => { await logout(); navigate('/login', { replace: true }) }

  return <div className="app-layout">
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark">D</span><div><strong>DauOi</strong><small>Booking studio</small></div></div>
      <nav>{navItems.map((item) => <NavLink key={item.to} to={item.to}><Icon name={item.icon} /><span>{item.label}</span></NavLink>)}</nav>
      <div className="sidebar-user"><span className="avatar">{user?.fullName?.charAt(0) || 'U'}</span><div><strong>{user?.fullName}</strong><small>{user?.role}</small></div><button onClick={handleLogout} aria-label="Đăng xuất"><Icon name="logout" /></button></div>
    </aside>
    <div className="app-main">
      <header className="topbar">
        <div><p className="eyebrow">DauOi · vận hành</p><h1>{pageName}</h1></div>
        <button className="profile-chip" onClick={handleLogout} aria-label="Đăng xuất"><span>{user?.fullName?.charAt(0) || 'U'}</span><div><strong>{user?.fullName?.split(' ').slice(-2).join(' ')}</strong><small>{user?.role === 'admin' ? 'Quản trị viên' : user?.role === 'manager' ? 'Quản lý' : 'Nhân viên'}</small></div></button>
      </header>
      <main className="page-content"><Outlet /></main>
    </div>
    <nav className="bottom-nav">{navItems.slice(0, 4).map((item) => <NavLink key={item.to} to={item.to}><Icon name={item.icon} /><span>{item.label}</span></NavLink>)}</nav>
  </div>
}
