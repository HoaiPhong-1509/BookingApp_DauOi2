import { useEffect, useState } from 'react'
import Modal from '../common/Modal'
import { createBooking } from '../../api/bookingApi'
import { getErrorMessage, getId, toDateTimeLocal } from '../../utils/format'

export default function BookingModal({ resource, user, open, onClose, onSuccess }) {
  const initialTime = new Date(Date.now() + 15 * 60 * 1000)
  const [form, setForm] = useState({ customerName: '', customerPhone: '', guestCount: 2, bookingTime: toDateTimeLocal(initialTime), holdUntil: toDateTimeLocal(new Date(initialTime.getTime() + 45 * 60 * 1000)), note: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => { if (resource) setForm((value) => ({ ...value, guestCount: Math.min(resource.capacity || 2, 4) })) }, [resource])
  if (!resource) return null

  const submit = async (event) => {
    event.preventDefault(); setBusy(true); setError('')
    if (new Date(form.holdUntil) <= new Date(form.bookingTime)) { setError('Thời gian giữ chỗ phải sau giờ khách đến.'); setBusy(false); return }
    try {
      await createBooking({ ...form, guestCount: Number(form.guestCount), branchId: getId(resource.branchId) || getId(user?.branchId), resourceId: resource._id, bookingTime: new Date(form.bookingTime).toISOString(), holdUntil: new Date(form.holdUntil).toISOString() })
      onSuccess('Đã tạo booking mới')
    } catch (err) { setError(getErrorMessage(err, 'Bàn/phòng này có thể vừa được người khác đặt.')) } finally { setBusy(false) }
  }

  return <Modal open={open} onClose={onClose} eyebrow={`${resource.code} · ${resource.name}`} title="Đặt chỗ mới">
    <form className="form-stack booking-form" onSubmit={submit}>
      <div className="selection-summary"><span className="selection-icon">{resource.type === 'room' ? '▦' : '◇'}</span><div><strong>{resource.name}</strong><small>{resource.capacity} chỗ · Nhân viên: {user?.fullName}</small></div></div>
      <div className="form-grid form-grid--2"><label>Tên khách hàng<input autoFocus value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} placeholder="Ví dụ: Anh Minh" required /></label><label>Số điện thoại<input inputMode="tel" value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} placeholder="09xx xxx xxx" /></label></div>
      <div className="form-grid form-grid--3"><label>Số khách<input type="number" min="1" max={resource.capacity} value={form.guestCount} onChange={(e) => setForm({ ...form, guestCount: e.target.value })} required /></label><label className="span-2">Giờ khách đến<input type="datetime-local" value={form.bookingTime} onChange={(e) => setForm({ ...form, bookingTime: e.target.value })} required /></label></div>
      <label>Giữ chỗ đến<input type="datetime-local" value={form.holdUntil} onChange={(e) => setForm({ ...form, holdUntil: e.target.value })} required /></label>
      <label>Ghi chú<textarea rows="2" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Vị trí yêu thích, yêu cầu đặc biệt…" /></label>
      {error && <p className="form-error">{error}</p>}
      <div className="modal-actions"><button type="button" className="button button--ghost" onClick={onClose}>Để sau</button><button className="button button--primary" disabled={busy}>{busy ? 'Đang lưu…' : 'Xác nhận đặt chỗ'}</button></div>
    </form>
  </Modal>
}
