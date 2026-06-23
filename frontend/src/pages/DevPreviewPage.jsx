import { useState } from 'react'
import { FLOORS } from '../constants/resourceTypes'
import ResourceMap from '../components/map/ResourceMap'
import ResourceLegend from '../components/map/ResourceLegend'
import BookingModal from '../components/booking/BookingModal'
import BookingDetailModal from '../components/booking/BookingDetailModal'
import ResourceEditorModal from '../components/map/ResourceEditorModal'
import Icon from '../components/common/Icon'

const booking = { _id: 'b1', customerName: 'Chị Ngọc Anh', customerPhone: '090 812 3456', guestCount: 4, bookingTime: new Date(Date.now() + 30 * 60000).toISOString(), holdUntil: new Date(Date.now() + 60 * 60000).toISOString(), note: 'Ưu tiên gần cửa sổ' }
const samples = [
  { _id: '1', branchId: 'demo', name: 'Bàn cửa sổ', code: 'T01', type: 'table', capacity: 2, status: 'active', reservationStatus: 'available', layout: { floor: 'ground', variant: 'square_2', x: 35, y: 70, width: 72, height: 72 } },
  { _id: '2', branchId: 'demo', name: 'Bàn trung tâm', code: 'T02', type: 'table', capacity: 4, status: 'active', reservationStatus: 'reserved', currentBookingId: booking, layout: { floor: 'ground', variant: 'rectangle_4', x: 185, y: 85, width: 108, height: 68 } },
  { _id: '3', branchId: 'demo', name: 'Bàn nhóm', code: 'T08', type: 'table', capacity: 8, status: 'active', reservationStatus: 'available', layout: { floor: 'ground', variant: 'long_8', x: 72, y: 255, width: 150, height: 64, rotation: 90 } },
  { _id: '4', branchId: 'demo', name: 'Phòng họp Mộc', code: 'P01', type: 'room', capacity: 10, status: 'active', reservationStatus: 'available', layout: { floor: 'ground', variant: 'meeting_room', x: 150, y: 420, width: 174, height: 112 } },
  { _id: '5', branchId: 'demo', name: 'Tường ngăn', code: 'W01', type: 'obstacle', capacity: 0, status: 'active', reservationStatus: 'inactive', layout: { floor: 'ground', variant: 'wall', x: 128, y: 65, width: 18, height: 150 } },
  { _id: '6', branchId: 'demo', name: 'Bàn lửng', code: 'L01', type: 'table', capacity: 4, status: 'maintenance', reservationStatus: 'available', layout: { floor: 'mezzanine', variant: 'rectangle_4', x: 100, y: 150, width: 108, height: 68 } },
]

export default function DevPreviewPage() {
  const [floor, setFloor] = useState('ground')
  const [editing, setEditing] = useState(false)
  const [selected, setSelected] = useState(null)
  const [modal, setModal] = useState(null)
  const [resources, setResources] = useState(samples)
  const select = (resource) => { setSelected(resource); if (editing) setModal('editor'); else if (resource.type !== 'obstacle') setModal(resource.currentBookingId ? 'detail' : 'booking') }
  const move = (id, position) => setResources((items) => items.map((item) => item._id === id ? { ...item, layout: { ...item.layout, ...position } } : item))
  return <main className="page-content dashboard-page preview-page"><section className="dashboard-intro"><div><p className="eyebrow">Sơ đồ trực tiếp · Chi nhánh trung tâm</p><h2>Chào Linh, sẵn sàng đón khách.</h2><p className="muted">Chạm vào vị trí để đặt chỗ hoặc xác nhận khách đến.</p></div><div className="dashboard-actions"><button className="icon-button icon-button--border"><Icon name="refresh" /></button><button className={`button ${editing ? 'button--primary' : 'button--secondary'} edit-layout-button`} onClick={() => setEditing(!editing)}><Icon name={editing ? 'check' : 'edit'} />{editing ? 'Xong' : 'Sửa sơ đồ'}</button></div></section><section className="map-shell"><div className="floor-tabs">{FLOORS.map((item) => <button key={item.id} className={floor === item.id ? 'active' : ''} onClick={() => setFloor(item.id)}><span>{item.label}</span><small>{resources.filter((resource) => resource.layout.floor === item.id && resource.type !== 'obstacle').length}</small></button>)}</div><div className="map-toolbar"><ResourceLegend /><div className="map-summary"><span><b>3</b> trống</span><span><b>1</b> đang giữ</span></div></div><ResourceMap resources={resources.filter((resource) => resource.layout.floor === floor)} editing={editing} selectedId={selected?._id} onSelect={select} onMove={move} onDrop={() => {}} onAdd={() => { setSelected(null); setModal('editor') }} /></section><BookingModal open={modal === 'booking'} resource={selected} user={{ fullName: 'Nguyễn Thùy Linh', branchId: 'demo' }} onClose={() => setModal(null)} onSuccess={() => setModal(null)} /><BookingDetailModal open={modal === 'detail'} resource={selected} onClose={() => setModal(null)} onSuccess={() => setModal(null)} /><ResourceEditorModal open={modal === 'editor'} resource={selected} floor={floor} branchId="demo" resourceCount={resources.length} onClose={() => setModal(null)} onSuccess={() => setModal(null)} /></main>
}
