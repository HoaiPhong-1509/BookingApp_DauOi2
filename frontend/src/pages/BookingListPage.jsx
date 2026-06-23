import { useEffect, useState } from 'react'
import { getBookings } from '../api/bookingApi'
import { formatDateTime } from '../utils/format'
import PageHeader from '../components/common/PageHeader'
import Icon from '../components/common/Icon'
import { EmptyState, ErrorState, Loading } from '../components/common/States'

const labels = { reserved: 'Đang giữ', checked_in: 'Đã đến', cancelled: 'Đã hủy', no_show: 'Không đến' }

export default function BookingListPage() {
  const [items, setItems] = useState([])
  const [pagination, setPagination] = useState({})
  const [filters, setFilters] = useState({ search: '', status: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const load = async () => {
    setLoading(true)
    try { const result = await getBookings({ ...filters, limit: 30 }); setItems(result.data || []); setPagination(result.pagination || {}); setError('') }
    catch { setError('Không thể tải lịch sử booking.') } finally { setLoading(false) }
  }
  useEffect(() => { const timer = setTimeout(load, 250); return () => clearTimeout(timer) }, [filters.search, filters.status])

  return <div className="list-page"><PageHeader eyebrow="Tra cứu 30 ngày gần nhất" title="Lịch sử booking" description="Booking hoàn tất sẽ tự động được xóa khỏi hệ thống sau 30 ngày." actions={<span className="count-pill">{pagination.total || 0} booking</span>} />
    <div className="filter-bar"><label className="search-field"><Icon name="search" /><input value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} placeholder="Tên hoặc số điện thoại" /></label><select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}><option value="">Tất cả trạng thái</option><option value="reserved">Đang giữ</option><option value="checked_in">Đã đến</option><option value="cancelled">Đã hủy</option><option value="no_show">Không đến</option></select></div>
    {loading ? <Loading /> : error ? <ErrorState message={error} onRetry={load} /> : !items.length ? <EmptyState title="Không tìm thấy booking" description="Thử thay đổi từ khóa hoặc bộ lọc trạng thái." /> : <div className="data-list">{items.map((booking) => <article className="booking-row" key={booking._id}><div className="row-avatar">{booking.customerName?.charAt(0)}</div><div className="row-main"><div className="row-title"><strong>{booking.customerName}</strong><span className={`status-badge status-badge--${booking.status}`}>{labels[booking.status]}</span></div><p>{booking.resourceId?.code || '—'} · {booking.resourceId?.name || 'Bàn/phòng'} · {booking.guestCount} khách</p><div className="row-meta"><span><Icon name="clock" size={15} />{formatDateTime(booking.bookingTime)}</span>{booking.customerPhone && <span><Icon name="phone" size={15} />{booking.customerPhone}</span>}</div></div></article>)}</div>}
  </div>
}
