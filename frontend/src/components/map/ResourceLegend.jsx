export default function ResourceLegend() {
  return <div className="map-legend" aria-label="Chú thích trạng thái">
    <span><i className="legend-dot legend-dot--available" />Trống</span>
    <span><i className="legend-dot legend-dot--reserved" />Đã đặt</span>
    <span><i className="legend-dot legend-dot--maintenance" />Bảo trì</span>
    <span><i className="legend-wall" />Vật cản</span>
  </div>
}
