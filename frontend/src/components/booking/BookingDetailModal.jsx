import { useState } from 'react'
import Modal from '../common/Modal'
import Icon from '../common/Icon'
import { cancelBooking, checkInBooking } from '../../api/bookingApi'
import { formatDateTime, getErrorMessage } from '../../utils/format'

export default function BookingDetailModal({ resource, open, onClose, onSuccess }) {
  const booking = resource?.currentBookingId || resource?.currentBooking
  const [mode, setMode] = useState('details')
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  if (!resource || !booking) return null

  const act = async (action) => {
    setBusy(true); setError('')
    try {
      if (action === 'checkin') await checkInBooking(booking._id)
      else await cancelBooking(booking._id, reason)
      onSuccess(action === 'checkin' ? 'Đã xác nhận khách nhận bàn/phòng' : 'Đã hủy booking')
    } catch (err) { setError(getErrorMessage(err)) } finally { setBusy(false) }
  }

  return <Modal open={open} onClose={onClose} eyebrow={`${resource.code} · Đang giữ chỗ`} title={booking.customerName || 'Chi tiết booking'}>
    <div className="booking-detail">
      <div className="guest-hero"><span>{booking.customerName?.charAt(0) || 'K'}</span><div><h3>{booking.customerName}</h3><p>{booking.guestCount} khách · {resource.name}</p></div></div>
      <div className="detail-grid"><div><Icon name="clock" /><span>Khách đến<small>{formatDateTime(booking.bookingTime)}</small></span></div><div><Icon name="phone" /><span>Điện thoại<small>{booking.customerPhone || 'Không cung cấp'}</small></span></div><div className="detail-wide"><Icon name="calendar" /><span>Giữ bàn đến<small>{formatDateTime(booking.holdUntil)}</small></span></div></div>
      {booking.note && <div className="note-box"><strong>Ghi chú</strong><p>{booking.note}</p></div>}
      {mode === 'checkin' && <div className="confirm-box"><strong>Xác nhận khách đã đến?</strong><p>Bàn/phòng sẽ lập tức trở về trạng thái trống để nhận booking tiếp theo.</p><div><button className="button button--ghost" onClick={() => setMode('details')}>Quay lại</button><button className="button button--primary" onClick={() => act('checkin')} disabled={busy}>Xác nhận khách đã đến</button></div></div>}
      {mode === 'cancel' && <div className="confirm-box confirm-box--danger"><strong>Hủy booking này?</strong><label>Lý do hủy (không bắt buộc)<textarea rows="2" value={reason} onChange={(e) => setReason(e.target.value)} /></label><div><button className="button button--ghost" onClick={() => setMode('details')}>Quay lại</button><button className="button button--danger" onClick={() => act('cancel')} disabled={busy}>Hủy booking</button></div></div>}
      {error && <p className="form-error">{error}</p>}
      {mode === 'details' && <div className="modal-actions modal-actions--stack-mobile"><button className="button button--danger-soft" onClick={() => setMode('cancel')}>Hủy booking</button><button className="button button--primary" onClick={() => setMode('checkin')}><Icon name="check" /> Khách đã đến</button></div>}
    </div>
  </Modal>
}
