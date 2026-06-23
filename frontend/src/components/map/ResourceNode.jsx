import { useRef } from 'react'
import { getPreset } from '../../constants/resourceTypes'
import { formatTime } from '../../utils/format'

export default function ResourceNode({ resource, editing, selected, onSelect, onMove, onDrop }) {
  const suppressClickRef = useRef(false)
  const preset = getPreset(resource)
  const booking = resource.currentBookingId || resource.currentBooking
  const isObstacle = resource.type === 'obstacle'
  const isReserved = booking?.status === 'reserved' || resource.reservationStatus === 'reserved'
  const state = isObstacle ? 'obstacle' : resource.status === 'maintenance' ? 'maintenance' : resource.status === 'inactive' ? 'inactive' : isReserved ? 'reserved' : 'available'
  const layout = resource.layout || {}
  const style = {
    left: `${((layout.x ?? 24) / 360) * 100}%`,
    top: `${((layout.y ?? 32) / 640) * 100}%`,
    width: `${((layout.width || preset.width) / 360) * 100}%`,
    height: `${((layout.height || preset.height) / 640) * 100}%`,
    transform: `rotate(${layout.rotation || 0}deg)`,
  }

  const pointerDown = (event) => {
    if (!editing || !event.isPrimary || event.button !== 0) return

    const node = event.currentTarget
    const pointerId = event.pointerId
    const canvas = node.parentElement.getBoundingClientRect()
    const nodeRect = node.getBoundingClientRect()
    const startX = event.clientX
    const startY = event.clientY
    const offsetX = startX - nodeRect.left
    const offsetY = startY - nodeRect.top
    const width = layout.width || preset.width
    const height = layout.height || preset.height
    let dragging = false
    let finished = false
    let finalPosition = null

    node.setPointerCapture(pointerId)

    const cleanup = () => {
      node.removeEventListener('pointermove', move)
      node.removeEventListener('pointerup', finish)
      node.removeEventListener('pointercancel', cancel)
      if (node.hasPointerCapture(pointerId)) node.releasePointerCapture(pointerId)
    }

    const move = (moveEvent) => {
      if (moveEvent.pointerId !== pointerId || finished) return
      if (moveEvent.pointerType === 'mouse' && (moveEvent.buttons & 1) !== 1) {
        cancel(moveEvent)
        return
      }

      const distance = Math.hypot(moveEvent.clientX - startX, moveEvent.clientY - startY)
      if (!dragging && distance < 6) return
      dragging = true

      const x = Math.max(4, Math.min(356 - width, ((moveEvent.clientX - canvas.left - offsetX) / canvas.width) * 360))
      const y = Math.max(4, Math.min(636 - height, ((moveEvent.clientY - canvas.top - offsetY) / canvas.height) * 640))
      finalPosition = { x: Math.round(x), y: Math.round(y) }
      onMove(resource._id, finalPosition)
    }

    function finish(upEvent) {
      if (upEvent.pointerId !== pointerId || finished) return
      finished = true
      cleanup()
      if (dragging && finalPosition) {
        suppressClickRef.current = true
        onDrop(resource._id, finalPosition)
      }
    }

    function cancel(cancelEvent) {
      if (cancelEvent.pointerId !== pointerId || finished) return
      finished = true
      cleanup()
    }

    node.addEventListener('pointermove', move)
    node.addEventListener('pointerup', finish)
    node.addEventListener('pointercancel', cancel)
  }

  const handleClick = (event) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false
      event.preventDefault()
      event.stopPropagation()
      return
    }
    onSelect(resource)
  }

  return <button
    className={`resource-node resource-node--${preset.id} resource-node--${state} ${selected ? 'resource-node--selected' : ''} ${editing ? 'resource-node--editing' : ''}`}
    style={style}
    onPointerDown={pointerDown}
    onClick={handleClick}
    aria-label={`${resource.name}, ${state}`}
  >
    {isObstacle ? <span className="wall-label">TƯỜNG</span> : <>
      <strong title={resource.name}>{resource.name}</strong>
      {isReserved ? <div className="node-booking"><span>{booking?.customerName || 'Đã đặt'}</span><small>{formatTime(booking?.bookingTime)}</small></div> : <small>{resource.status === 'maintenance' ? 'Bảo trì' : resource.status === 'inactive' ? 'Tạm đóng' : `${resource.capacity} chỗ · Trống`}</small>}
    </>}
    {editing && !isObstacle && <i className="drag-grip">•••</i>}
  </button>
}
