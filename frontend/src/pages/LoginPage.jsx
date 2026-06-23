import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import Icon from '../components/common/Icon'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const { login, isLoading, error, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  const submit = async (event) => {
    event.preventDefault()
    try { await login(form); navigate(location.state?.from?.pathname || '/dashboard', { replace: true }) } catch { /* shown by store */ }
  }

  return <main className="auth-page">
    <section className="auth-visual"><div className="auth-brand"><span className="brand-mark">D</span><span>DauOi</span></div><div className="visual-copy"><span className="live-pill">● Vận hành nhẹ nhàng</span><h1>Mỗi vị trí,<br />một trải nghiệm.</h1><p>Sơ đồ trực quan giúp đội ngũ đón khách nhanh, đúng và thoải mái hơn.</p></div><div className="visual-map"><span className="mini-table a">T01</span><span className="mini-table b">T04</span><span className="mini-table reserved">T08<small>18:30</small></span><span className="mini-room">PHÒNG HỌP</span></div></section>
    <section className="auth-panel"><div className="auth-form-wrap"><p className="eyebrow">Chào mừng trở lại</p><h2>Bắt đầu ca làm việc</h2><p className="muted">Đăng nhập để xem sơ đồ và quản lý booking hôm nay.</p>
      <form onSubmit={submit} className="form-stack">
        <label>Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="ten@dauoi.vn" autoComplete="email" required /></label>
        <label>Mật khẩu<input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Nhập mật khẩu" autoComplete="current-password" required /></label>
        {error && <p className="form-error">{error}</p>}
        <button className="button button--primary button--large" disabled={isLoading}>{isLoading ? <span className="spinner spinner--light" /> : <>Đăng nhập <Icon name="chevron" size={18} /></>}</button>
      </form>
      <p className="auth-switch">Chưa có tài khoản? <Link to="/register">Đăng ký tại đây</Link></p>
    </div></section>
  </main>
}
