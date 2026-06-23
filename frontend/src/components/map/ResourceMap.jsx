import ResourceNode from './ResourceNode'
import { EmptyState } from '../common/States'
import Icon from '../common/Icon'

export default function ResourceMap({ resources, editing, selectedId, onSelect, onMove, onDrop, onAdd }) {
  return <div className={`floor-canvas ${editing ? 'floor-canvas--editing' : ''}`}>
    <div className="floor-canvas__door"><span>LỐI VÀO</span><i /></div>
    <div className="floor-canvas__grid" />
    {resources.map((resource) => <ResourceNode key={resource._id} resource={resource} editing={editing} selected={selectedId === resource._id} onSelect={onSelect} onMove={onMove} onDrop={onDrop} />)}
    {!resources.length && <div className="canvas-empty"><EmptyState title="Khu vực đang trống" description={editing ? 'Thêm bàn, phòng hoặc tường để bắt đầu bố trí.' : 'Quản lý chưa thiết kế khu vực này.'} action={editing && <button className="button button--primary" onClick={onAdd}><Icon name="plus" /> Thêm đối tượng</button>} /></div>}
    {editing && <div className="edit-hint"><Icon name="layout" size={16} /> Chạm giữ và kéo để di chuyển</div>}
  </div>
}
