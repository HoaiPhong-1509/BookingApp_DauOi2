import { useEffect, useState } from 'react'
import Modal from '../common/Modal'
import Icon from '../common/Icon'
import { FLOORS, RESOURCE_PRESETS } from '../../constants/resourceTypes'
import { createResource, deleteResource, updateResource } from '../../api/resourceApi'
import { getErrorMessage } from '../../utils/format'

const nextCode = (preset, count) => `${preset.type === 'room' ? 'P' : preset.type === 'obstacle' ? 'W' : 'T'}${String(count + 1).padStart(2, '0')}`

export default function ResourceEditorModal({ open, onClose, resource, floor, branchId, resourceCount, onSuccess }) {
  const [presetId, setPresetId] = useState('square_2')
  const [scale, setScale] = useState(100)
  const [form, setForm] = useState({ name: '', code: '', status: 'active', description: '', rotation: 0 })
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const preset = RESOURCE_PRESETS.find((item) => item.id === presetId) || RESOURCE_PRESETS[0]

  useEffect(() => {
    if (resource) {
      const inferred = resource.layout?.variant || (resource.type === 'obstacle' ? 'wall' : resource.type === 'room' ? 'meeting_room' : resource.capacity >= 8 ? 'long_8' : resource.capacity >= 4 ? 'rectangle_4' : 'square_2')
      const inferredPreset = RESOURCE_PRESETS.find((item) => item.id === inferred) || RESOURCE_PRESETS[0]
      setPresetId(inferred)
      const inferredScale = Math.round(((resource.layout?.width || inferredPreset.width) / inferredPreset.width) * 100)
      setScale(Math.max(20, Math.min(160, inferredScale)))
      setForm({ name: resource.name, code: resource.code, status: resource.status, description: resource.description || '', rotation: resource.layout?.rotation || 0 })
    } else {
      const first = RESOURCE_PRESETS[0]
      setScale(100)
      setPresetId(first.id); setForm({ name: first.label, code: nextCode(first, resourceCount), status: 'active', description: '', rotation: 0 })
    }
    setError(''); setConfirmDelete(false)
  }, [resource, open, resourceCount])

  const choosePreset = (item) => {
    setPresetId(item.id)
    if (!resource) setScale(100)
    if (!resource) setForm((value) => ({ ...value, name: item.label, code: nextCode(item, resourceCount) }))
  }

  const submit = async (event) => {
    event.preventDefault(); setBusy(true); setError('')
    const oldLayout = resource?.layout || {}
    const scaleRatio = scale / 100
    const payload = { branchId, name: form.name, code: form.code.toUpperCase(), type: preset.type, capacity: preset.capacity, description: form.description, status: preset.type === 'obstacle' ? 'active' : form.status, locationLabel: floor, layout: { floor, variant: preset.id, x: oldLayout.x ?? 100, y: oldLayout.y ?? 210, width: Math.round(preset.width * scaleRatio), height: Math.round(preset.height * scaleRatio), rotation: Number(form.rotation) || 0 } }
    try {
      if (resource) await updateResource(resource._id, payload)
      else await createResource(payload)
      onSuccess(resource ? 'Đã cập nhật đối tượng' : 'Đã thêm vào sơ đồ')
    } catch (err) { setError(getErrorMessage(err, 'Không thể lưu đối tượng này.')) } finally { setBusy(false) }
  }

  const remove = async () => {
    setBusy(true); setError('')
    try { await deleteResource(resource._id); onSuccess('Đã xóa khỏi sơ đồ') } catch (err) { setError(getErrorMessage(err, 'Không thể xóa đối tượng này.')) } finally { setBusy(false) }
  }

  return <Modal open={open} onClose={onClose} eyebrow={resource ? `${resource.code} · Chỉnh sửa` : 'Thiết kế sơ đồ'} title={resource ? 'Cập nhật đối tượng' : 'Thêm đối tượng'}>
    <form className="form-stack editor-form" onSubmit={submit}>
      <fieldset><legend>Chọn loại</legend><div className="preset-grid">{RESOURCE_PRESETS.map((item) => <button type="button" key={item.id} className={`preset-card ${presetId === item.id ? 'active' : ''}`} onClick={() => choosePreset(item)}><i className={`preset-shape preset-shape--${item.id}`} /><span>{item.short}</span></button>)}</div></fieldset>
      <div className="form-grid form-grid--2"><label>Tên hiển thị<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label><label>Mã đối tượng<input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required /></label></div>
      {preset.type !== 'obstacle' && <label>Trạng thái<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="active">Đang hoạt động</option><option value="maintenance">Bảo trì</option><option value="inactive">Tạm ngưng</option></select></label>}
      <label className="size-control"><span>Kích thước đối tượng <b>{scale}%</b></span><div><small>20%</small><input type="range" min="20" max="160" step="5" value={scale} onChange={(e) => setScale(Number(e.target.value))} /><small>160%</small></div></label>
      <div className="object-size-preview"><i className={`preset-shape preset-shape--${preset.id}`} style={{ transform: `scale(${Math.min(scale / 100, 1.35)})` }} /><span>{form.name || preset.label}</span></div>
      <div className="form-grid form-grid--2"><label>Góc xoay<select value={form.rotation} onChange={(e) => setForm({ ...form, rotation: e.target.value })}><option value="0">0°</option><option value="90">90°</option><option value="180">180°</option><option value="270">270°</option></select></label><label>Khu vực<input value={FLOORS.find((item) => item.id === floor)?.label || floor} disabled /></label></div>
      <label>Mô tả<input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Gần cửa sổ, khu yên tĩnh…" /></label>
      {error && <p className="form-error">{error}</p>}
      {confirmDelete && <div className="confirm-box confirm-box--danger"><strong>Xóa {resource?.name}?</strong><p>Đối tượng sẽ biến mất khỏi sơ đồ. Lịch sử booking liên quan vẫn được giữ theo chính sách hệ thống.</p><div><button type="button" className="button button--ghost" onClick={() => setConfirmDelete(false)}>Không xóa</button><button type="button" className="button button--danger" onClick={remove} disabled={busy}>Xóa</button></div></div>}
      {!confirmDelete && <div className="modal-actions">{resource && <button type="button" className="button button--danger-soft button--icon" onClick={() => setConfirmDelete(true)}><Icon name="trash" /></button>}<span className="action-spacer" /><button type="button" className="button button--ghost" onClick={onClose}>Đóng</button><button className="button button--primary" disabled={busy}>{busy ? 'Đang lưu…' : resource ? 'Lưu thay đổi' : 'Thêm vào sơ đồ'}</button></div>}
    </form>
  </Modal>
}
