import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getBranches } from '../api/branchApi'
import { getResourcesByBranch, updateResource } from '../api/resourceApi'
import { FLOORS } from '../constants/resourceTypes'
import { getId } from '../utils/format'
import { useAuthStore } from '../stores/authStore'
import { useToastStore } from '../stores/toastStore'
import ResourceMap from '../components/map/ResourceMap'
import ResourceLegend from '../components/map/ResourceLegend'
import ResourceEditorModal from '../components/map/ResourceEditorModal'
import BookingModal from '../components/booking/BookingModal'
import BookingDetailModal from '../components/booking/BookingDetailModal'
import Icon from '../components/common/Icon'
import { ErrorState, Loading } from '../components/common/States'

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const showToast = useToastStore((state) => state.show)
  const canEdit = ['admin', 'manager'].includes(user?.role)
  const [branches, setBranches] = useState([])
  const [branchId, setBranchId] = useState(getId(user?.branchId) || '')
  const [floor, setFloor] = useState('ground')
  const [resources, setResources] = useState([])
  const resourcesRef = useRef([])
  const mapRequestInFlightRef = useRef(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)
  const [selected, setSelected] = useState(null)
  const [modal, setModal] = useState(null)

  useEffect(() => {
    if (user?.role !== 'admin') return
    getBranches({ status: 'active', limit: 100 }).then((result) => {
      setBranches(result.data || [])
      setBranchId((value) => value || getId(result.data?.[0]))
    }).catch(() => setError('Không thể tải danh sách chi nhánh.'))
  }, [user?.role])

  const loadMap = useCallback(async (quiet = false) => {
    if (!branchId) { setLoading(false); return }
    if (mapRequestInFlightRef.current) return
    mapRequestInFlightRef.current = true
    if (!quiet) setLoading(true)
    try {
      const data = await getResourcesByBranch(branchId)
      resourcesRef.current = data
      setResources(data)
      setError('')
    }
    catch { setError('Không thể tải sơ đồ. Kiểm tra kết nối và thử lại.') }
    finally {
      mapRequestInFlightRef.current = false
      if (!quiet) setLoading(false)
    }
  }, [branchId])

  useEffect(() => {
    loadMap()
    const timer = setInterval(() => {
      if (!editing && document.visibilityState === 'visible') loadMap(true)
    }, 20000)
    return () => clearInterval(timer)
  }, [loadMap, editing])

  const floorResources = useMemo(() => resources.filter((resource) => (resource.layout?.floor || resource.locationLabel || 'ground') === floor), [resources, floor])
  const reservedCount = resources.filter((resource) => (resource.currentBookingId || resource.currentBooking)?.status === 'reserved' || resource.reservationStatus === 'reserved').length
  const availableCount = resources.filter((resource) => resource.type !== 'obstacle' && resource.status === 'active' && resource.reservationStatus !== 'reserved').length

  const selectResource = (resource) => {
    setSelected(resource)
    if (editing) { setModal('editor'); return }
    if (resource.type === 'obstacle') return
    if (resource.status !== 'active') { showToast(resource.status === 'maintenance' ? 'Đối tượng đang bảo trì' : 'Đối tượng đang tạm ngưng', 'error'); return }
    setModal(resource.currentBookingId || resource.currentBooking || resource.reservationStatus === 'reserved' ? 'detail' : 'booking')
  }

  const moveResource = (id, position) => setResources((items) => {
    const nextItems = items.map((item) => item._id === id ? { ...item, layout: { ...item.layout, ...position } } : item)
    resourcesRef.current = nextItems
    return nextItems
  })
  const savePosition = async (id, finalPosition) => {
    // Pointer handlers retain the render in which dragging started. The ref
    // always contains the final coordinates from the latest pointer move.
    const item = resourcesRef.current.find((resource) => resource._id === id)
    if (!item) return
    const finalLayout = { ...item.layout, ...finalPosition }
    try { await updateResource(id, { layout: finalLayout }); showToast('Đã lưu vị trí') } catch { showToast('Chưa lưu được vị trí', 'error'); loadMap(true) }
  }
  const success = (message) => { setModal(null); setSelected(null); showToast(message); loadMap() }

  return <div className="dashboard-page">
    <section className="dashboard-intro"><div><p className="eyebrow">Sơ đồ trực tiếp</p><h2>Chào {user?.fullName?.split(' ').slice(-1)}, sẵn sàng đón khách.</h2><p className="muted">Chạm vào vị trí để đặt chỗ hoặc xác nhận khách đến.</p></div><div className="dashboard-actions">{user?.role === 'admin' && <label className="branch-picker"><span>Chi nhánh</span><select value={branchId} onChange={(e) => setBranchId(e.target.value)}>{branches.map((branch) => <option key={getId(branch)} value={getId(branch)}>{branch.name}</option>)}</select></label>}<button className="icon-button icon-button--border" onClick={() => loadMap()} aria-label="Làm mới"><Icon name="refresh" /></button>{canEdit && <button className={`button ${editing ? 'button--primary' : 'button--secondary'} edit-layout-button`} onClick={() => { setEditing(!editing); setSelected(null) }}><Icon name={editing ? 'check' : 'edit'} />{editing ? 'Xong' : 'Sửa sơ đồ'}</button>}</div></section>
    <section className="map-shell">
      <div className="floor-tabs" role="tablist">{FLOORS.map((item) => { const count = resources.filter((resource) => (resource.layout?.floor || resource.locationLabel || 'ground') === item.id && resource.type !== 'obstacle').length; return <button key={item.id} role="tab" aria-selected={floor === item.id} className={floor === item.id ? 'active' : ''} onClick={() => { setFloor(item.id); setSelected(null) }}><span>{item.label}</span><small>{count}</small></button> })}</div>
      <div className="map-toolbar"><ResourceLegend /><div className="map-summary"><span><b>{availableCount}</b> trống</span><span><b>{reservedCount}</b> đang giữ</span></div></div>
      {loading ? <Loading label="Đang dựng sơ đồ…" /> : error ? <ErrorState message={error} onRetry={loadMap} /> : !branchId ? <ErrorState message="Tài khoản chưa được gán chi nhánh." /> : <ResourceMap resources={floorResources} editing={editing} selectedId={selected?._id} onSelect={selectResource} onMove={moveResource} onDrop={savePosition} onAdd={() => { setSelected(null); setModal('editor') }} />}
      {editing && <button className="floating-add" onClick={() => { setSelected(null); setModal('editor') }}><Icon name="plus" /><span>Thêm đối tượng</span></button>}
    </section>
    <BookingModal resource={selected} user={user} open={modal === 'booking'} onClose={() => setModal(null)} onSuccess={success} />
    <BookingDetailModal resource={selected} open={modal === 'detail'} onClose={() => setModal(null)} onSuccess={success} />
    <ResourceEditorModal open={modal === 'editor'} onClose={() => { setModal(null); setSelected(null) }} resource={selected} floor={floor} branchId={branchId} resourceCount={resources.length} onSuccess={success} />
  </div>
}
