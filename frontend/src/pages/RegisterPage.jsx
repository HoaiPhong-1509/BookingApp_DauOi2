import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

export default function RegisterPage() {
  const register = useAuthStore((state) => state.register)
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '' })
  const submit = async (event) => {
    event.preventDefault(); setBusy(true); setError('')
    try { await register(form); navigate('/pending-approval') } catch (err) { setError(err.response?.data?.message || 'Chưa thể đăng ký tài khoản.') } finally { setBusy(false) }
  }
  return <main className="auth-page auth-page--simple"><section className="auth-panel"><div className="auth-form-wrap"><Link className="back-link" to="/login">← Quay lại đăng nhập</Link><p className="eyebrow">Gia nhập đội ngũ</p><h2>Tạo tài khoản</h2><p className="muted">Tài khoản mới cần quản trị viên duyệt trước khi sử dụng.</p><form className="form-stack" onSubmit={submit}>
    <label>Họ và tên<input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required /></label>
    <label>Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></label>
    <label>Số điện thoại<input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
    <label>Mật khẩu<input type="password" minLength="8" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></label>
    {error && <p className="form-error">{error}</p>}<button className="button button--primary button--large" disabled={busy}>{busy ? 'Đang gửi…' : 'Gửi yêu cầu đăng ký'}</button>
  </form></div></section></main>
}
