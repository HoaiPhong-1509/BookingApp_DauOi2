import { useEffect, useState } from 'react'
import { approveUser, assignUserBranch, changeUserRole, getUsers, lockUser, unlockUser } from '../api/userApi'
import { getBranches } from '../api/branchApi'
import { getId } from '../utils/format'
import { useToastStore } from '../stores/toastStore'
import PageHeader from '../components/common/PageHeader'
import Icon from '../components/common/Icon'
import { EmptyState, ErrorState, Loading } from '../components/common/States'

const roleLabel = { admin: 'Quản trị', manager: 'Quản lý', employee: 'Nhân viên' }
export default function UserManagementPage() {
  const show = useToastStore((state) => state.show)
  const [users, setUsers] = useState([])
  const [branches, setBranches] = useState([])
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const load = async () => {
    setLoading(true)
    const userParams = { limit: 100, ...(status ? { status } : {}) }
    try { const [userResult, branchResult] = await Promise.all([getUsers(userParams), getBranches({ limit: 100 })]); setUsers(userResult.data || []); setBranches(branchResult.data || []); setError('') }
    catch { setError('Không thể tải danh sách nhân sự.') } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [status])
  const action = async (fn, message) => { try { await fn(); show(message); load() } catch (err) { show(err.response?.data?.message || 'Không thể thực hiện thao tác', 'error') } }

  return <div className="list-page"><PageHeader eyebrow="Quản trị hệ thống" title="Nhân sự" description="Duyệt tài khoản, phân quyền và gán chi nhánh." actions={<select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">Tất cả</option><option value="pending">Chờ duyệt</option><option value="active">Hoạt động</option><option value="blocked">Đã khóa</option></select>} />
    {loading ? <Loading /> : error ? <ErrorState message={error} onRetry={load} /> : !users.length ? <EmptyState title="Chưa có nhân sự" description="Không có tài khoản ở trạng thái này." /> : <div className="management-grid">{users.map((user) => <article className="management-card" key={user.id}><div className="card-head"><span className="avatar avatar--large">{user.fullName?.charAt(0)}</span><div><strong>{user.fullName}</strong><p>{user.email}</p></div><span className={`status-badge status-badge--${user.status}`}>{user.status === 'pending' ? 'Chờ duyệt' : user.status === 'active' ? 'Hoạt động' : 'Đã khóa'}</span></div><div className="card-fields"><label>Vai trò<select disabled={user.role === 'admin'} value={user.role} onChange={(e) => action(() => changeUserRole(user.id, e.target.value), 'Đã đổi vai trò')}><option value="employee">Nhân viên</option><option value="manager">Quản lý</option>{user.role === 'admin' && <option value="admin">Quản trị</option>}</select></label>{user.role !== 'admin' && <label>Chi nhánh<select value={getId(user.branchId) || ''} onChange={(e) => action(() => assignUserBranch(user.id, e.target.value), 'Đã gán chi nhánh')}><option value="">Chưa gán</option>{branches.map((branch) => <option key={getId(branch)} value={getId(branch)}>{branch.name}</option>)}</select></label>}</div><div className="card-actions">{user.status === 'pending' && <button className="button button--primary" onClick={() => action(() => approveUser(user.id), 'Đã duyệt tài khoản')}><Icon name="check" /> Duyệt</button>}{user.status === 'active' && user.role !== 'admin' && <button className="button button--danger-soft" onClick={() => action(() => lockUser(user.id), 'Đã khóa tài khoản')}>Khóa</button>}{user.status === 'blocked' && <button className="button button--secondary" onClick={() => action(() => unlockUser(user.id), 'Đã mở khóa')}>Mở khóa</button>}<span>{roleLabel[user.role]}</span></div></article>)}</div>}
  </div>
}
