import Icon from './Icon'

export const Loading = ({ label = 'Đang tải dữ liệu…' }) => <div className="state-card"><span className="spinner" /><p>{label}</p></div>
export const EmptyState = ({ title, description, action }) => <div className="state-card state-card--empty"><div className="state-icon"><Icon name="layout" /></div><h3>{title}</h3><p>{description}</p>{action}</div>
export const ErrorState = ({ message, onRetry }) => <div className="state-card state-card--error"><h3>Chưa tải được dữ liệu</h3><p>{message}</p>{onRetry && <button className="button button--secondary" onClick={onRetry}><Icon name="refresh" size={17} /> Thử lại</button>}</div>
