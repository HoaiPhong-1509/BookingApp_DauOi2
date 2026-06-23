import { useEffect, useState } from 'react'
import { createBranch, deleteBranch, getBranches, updateBranch } from '../api/branchApi'
import { getId, getErrorMessage } from '../utils/format'
import { useToastStore } from '../stores/toastStore'
import PageHeader from '../components/common/PageHeader'
import Modal from '../components/common/Modal'
import Icon from '../components/common/Icon'
import { EmptyState, ErrorState, Loading } from '../components/common/States'

export default function BranchManagementPage() {
  const show = useToastStore((state) => state.show)
  const [items, setItems] = useState([])
  const [selected, setSelected] = useState(null)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', code: '', address: '', phone: '', status: 'active' })
  const load = async () => { setLoading(true); try { const result = await getBranches({ limit: 100 }); setItems(result.data || []); setError('') } catch { setError('Không thể tải chi nhánh.') } finally { setLoading(false) } }
  useEffect(() => { load() }, [])
  const edit = (branch = null) => { setSelected(branch); setForm(branch ? { name: branch.name, code: branch.code, address: branch.address, phone: branch.phone, status: branch.status } : { name: '', code: '', address: '', phone: '', status: 'active' }); setOpen(true) }
  const submit = async (event) => { event.preventDefault(); try { selected ? await updateBranch(getId(selected), form) : await createBranch(form); show(selected ? 'Đã cập nhật chi nhánh' : 'Đã tạo chi nhánh'); setOpen(false); load() } catch (err) { show(getErrorMessage(err), 'error') } }
  const remove = async () => { if (!window.confirm(`Xóa chi nhánh ${selected.name}?`)) return; try { await deleteBranch(getId(selected)); show('Đã xóa chi nhánh'); setOpen(false); load() } catch (err) { show(getErrorMessage(err), 'error') } }

  return <div className="list-page"><PageHeader eyebrow="Cấu hình tổ chức" title="Chi nhánh" description="Quản lý các địa điểm đang vận hành." actions={<button className="button button--primary" onClick={() => edit()}><Icon name="plus" /> Thêm chi nhánh</button>} />
    {loading ? <Loading /> : error ? <ErrorState message={error} onRetry={load} /> : !items.length ? <EmptyState title="Chưa có chi nhánh" description="Tạo chi nhánh đầu tiên để bắt đầu thiết kế sơ đồ." /> : <div className="management-grid">{items.map((branch) => <button className="branch-card" key={getId(branch)} onClick={() => edit(branch)}><span className="branch-icon"><Icon name="building" /></span><div><strong>{branch.name}</strong><p>{branch.address || 'Chưa có địa chỉ'}</p><small>{branch.code} · {branch.phone || 'Chưa có SĐT'}</small></div><span className={`status-badge status-badge--${branch.status}`}>{branch.status === 'active' ? 'Hoạt động' : 'Tạm ngưng'}</span></button>)}</div>}
    <Modal open={open} onClose={() => setOpen(false)} eyebrow="Quản lý địa điểm" title={selected ? 'Sửa chi nhánh' : 'Thêm chi nhánh'}><form className="form-stack" onSubmit={submit}><div className="form-grid form-grid--2"><label>Tên chi nhánh<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label><label>Mã chi nhánh<input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} required /></label></div><label>Địa chỉ<input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></label><div className="form-grid form-grid--2"><label>Điện thoại<input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label><label>Trạng thái<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="active">Hoạt động</option><option value="inactive">Tạm ngưng</option></select></label></div><div className="modal-actions">{selected && <button type="button" className="button button--danger-soft" onClick={remove}>Xóa</button>}<span className="action-spacer" /><button className="button button--primary">{selected ? 'Lưu thay đổi' : 'Tạo chi nhánh'}</button></div></form></Modal>
  </div>
}
