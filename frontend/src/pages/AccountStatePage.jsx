import { Link } from 'react-router-dom'

export default function AccountStatePage({ blocked = false }) {
  return <main className="account-state"><div className="state-orb">{blocked ? '!' : '✓'}</div><p className="eyebrow">DauOi Booking</p><h1>{blocked ? 'Tài khoản đang bị khóa' : 'Đã gửi yêu cầu'}</h1><p>{blocked ? 'Liên hệ quản trị viên để được hỗ trợ mở lại tài khoản.' : 'Quản trị viên sẽ duyệt tài khoản của bạn. Sau khi được duyệt, hãy quay lại đăng nhập.'}</p><Link className="button button--primary" to="/login">Về trang đăng nhập</Link></main>
}
